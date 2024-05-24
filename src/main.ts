import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    Observable,
    concatAll,
    filter,
    forkJoin,
    map,
    of,
    switchMap,
} from 'rxjs';
import 'zone.js';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ScrollingModule } from '@angular/cdk/scrolling';

interface Author {
    id: number;
    name: string;
    age: number;
}

interface Article {
    id: number;
    title: string;
    authorId: number;
    isNew: boolean;
}

/**
 * @description Параметр определяет количество Article, которые будут сгенерированы
 */
const articlesNumber = 1000;

/**
 * @description Метод генерирует и возвращает массив Article
 * @param amount количество Article для генерации
 * @returns Article[]
 */
function generateArticles(amount: number) {
    return new Array(amount).fill(0).map((value, index) => {
        const article: Article = {
            id: index,
            title: 'article' + index,
            authorId: Math.round(Math.random() * 4) + 1,
            isNew: Math.random() > 0.5,
        };
        return article;
    });
}

function getAuthors(): Observable<Author[]> {
    return of([
        { id: 1, name: 'Author1', age: 65 },
        { id: 2, name: 'Author2', age: 87 },
        { id: 3, name: 'Author3', age: 43 },
        { id: 4, name: 'Author4', age: 51 },
        { id: 5, name: 'Author5', age: 35 },
    ]);
}

function getArticles(authorId: number): Observable<Article[]> {
    if (authorId === 1) {
        return of([
            { id: 1, title: 'article1', authorId, isNew: false },
            { id: 2, title: 'article2', authorId, isNew: true },
        ]);
    }
    if (authorId === 2) {
        return of([
            { id: 3, title: 'article3', authorId, isNew: false },
            { id: 4, title: 'article4', authorId, isNew: true },
        ]);
    }
    if (authorId === 3) {
        return of([
            { id: 5, title: 'article5', authorId, isNew: false },
            { id: 6, title: 'article6', authorId, isNew: true },
        ]);
    }
    if (authorId === 4) {
        return of([{ id: 7, title: 'article7', authorId, isNew: false }]);
    }
    return of([]);
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, ScrollingModule],
    template: `
        <div class="button-box">
            <button class="button" (click)="setNewArticles()">
                Сгенерировать посты
            </button>
        </div>
        <cdk-virtual-scroll-viewport itemSize="40" class="scroll-table-body">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Заголовок</th>
                        <th>Новый</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *cdkVirtualFor="let article of articles">
                        <td>{{ article.id }}</td>
                        <td>{{ article.title }}</td>
                        <td>{{ article.isNew ? 'Да' : 'Нет' }}</td>
                    </tr>
                </tbody>
            </table>
        </cdk-virtual-scroll-viewport>
    `,
    styles: [
        `
            .button-box {
                display: flex;
                justify-content: center;
                padding: 1.25%;
            }
            .button {
                background-color: red;
                font-size: 1rem;
                color: white;
                border-color: lightgray;
            }
            .scroll-table-body {
                height: 300px;
                overflow-x: auto;
                margin-bottom: 1.5%;
                border-bottom: 1px solid #eee;
            }

            .table {
                width: 100%;
                table-layout: fixed;
            }

            .table thead th {
                font-weight: bold;
                text-align: center;
                padding: 1% 1.5%;
                background: #d8d8d8;
                font-size: 1rem;
                border-left: 1px solid #ddd;
                border-right: 1px solid #ddd;
            }

            .table tbody td {
                text-align: center;
                border-left: 1px solid #ddd;
                border-right: 1px solid #ddd;
                padding: 1% 1.5%;
                font-size: 1rem;
            }
        `,
    ],
})
export class App implements OnInit {
    articles: Article[] = [];

    ngOnInit(): void {
        // получить новые статьи всех авторов, возрастом более 50 лет, используя rxJs
        // .subscribe((articles) => {
        //   this.articles = articles;
        // });

        getAuthors()
            .pipe(
                map((authors$) => {
                    return authors$.filter((author) => {
                        return author.age > 50;
                    });
                }),
                switchMap((filteredAuthors$) => {
                    return filteredAuthors$.map((author) => {
                        return getArticles(author.id);
                    });
                }),
                concatAll(),
                concatAll()
            )
            .subscribe({
                next: (article) => {
                    // Элементы приходят и добавляются в массив по одному
                    // Это позволяет наполнять компонент по мере загрузки
                    this.articles.push(article);
                },
            });
    }

    setNewArticles() {
        this.articles = generateArticles(articlesNumber);
    }
}

bootstrapApplication(App, {
    providers: [provideAnimationsAsync()],
});

// Дополнительное задание
// Сгенерировать 1kk записей
// Создать таблицу с виртуальным скроллом
// Сделать форк проекта с решением в stackblitz, приложить ссылку
