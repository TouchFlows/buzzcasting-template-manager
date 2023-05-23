// https://github.com/netlify-labs/oauth-example/blob/master/src/utils/sort.js
// License MIT
import objSize from '@/utils/objsize';

export function matchText(search: string, text: string) {
    if (!text || !search) {
        return false
    }
    return text.toLowerCase().indexOf(search.toLowerCase()) > -1
}

export function sortByDate(dateType: string | number, order: string) {
    return function (a: { [x: string]: string | number | Date; }, b: { [x: string]: string | number | Date; }) {
        const timeA = new Date(a[dateType]).getTime()
        const timeB = new Date(b[dateType]).getTime()
        if (order === 'asc') {
            return timeA - timeB
        }
        // default 'desc' descending order
        return timeB - timeA
    }
}

export function sortByName(key: string | number, order: string) {
    return function (a: { [x: string]: number; }, b: { [x: string]: number; }) {
        if (order === 'asc') {
            if (a[key] < b[key]) return -1
            if (a[key] > b[key]) return 1
        }
        if (a[key] > b[key]) return -1
        if (a[key] < b[key]) return 1
        return 0
    }
}

export function sortByPages(key: string | number, order: string) {
    return function (a: { [x: string]: string; }, b: { [x: string]: string; }) {
        const pagesA = JSON.parse(a[key]);
        const pagesB = JSON.parse(b[key]);
        if (order === 'desc') {
            if (pagesA.length < pagesB.length) return -1
            if (pagesA.length > pagesB.length) return 1
        }
        if (pagesA.length > pagesB.length) return -1
        if (pagesA.length < pagesB.length) return 1
        return 0
    }
}

export function sortBySize(order: string) {
    return function (a: any, b: any) {
        const sizeA = objSize(a);
        const sizeB = objSize(b);
        if (order === 'asc') {
            if (sizeA < sizeB) return -1
            if (sizeA > sizeB) return 1
        }
        if (sizeA > sizeB) return -1
        if (sizeA < sizeB) return 1
        return 0
    }
}