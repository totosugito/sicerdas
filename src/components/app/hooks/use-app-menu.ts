import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AppRoute } from '@/constants/app-route'

export interface MenuItem {
    title: string
    to: string
    params?: Record<string, string>
    search?: Record<string, string>
    description: string
}

export function useAppMenu() {
    const { t } = useTranslation()

    const booksMenu = useMemo<MenuItem[]>(() => [
        {
            title: t('landing.navbar.books.latestBooks'),
            to: AppRoute.book.books.url,
            description: t('landing.navbar.books.descriptions.latestBooks')
        },
        {
            title: t('landing.navbar.books.curriculum2006'),
            to: AppRoute.book.books.url,
            search: { category: '[1]' },
            description: t('landing.navbar.books.descriptions.curriculum2006')
        },
        {
            title: t('landing.navbar.books.curriculum2013'),
            to: AppRoute.book.books.url,
            search: { category: '[2]' },
            description: t('landing.navbar.books.descriptions.curriculum2013')
        },
        {
            title: t('landing.navbar.books.curriculumMerdeka'),
            to: AppRoute.book.books.url,
            search: { category: '[3]' },
            description: t('landing.navbar.books.descriptions.curriculumMerdeka')
        },
        {
            title: t('landing.navbar.books.educationBooks'),
            to: AppRoute.book.books.url,
            search: { category: '[4]' },
            description: t('landing.navbar.books.descriptions.educationBooks')
        },
        {
            title: t('landing.navbar.books.translationBooks'),
            to: AppRoute.book.books.url,
            search: { category: '[5]' },
            description: t('landing.navbar.books.descriptions.translationBooks')
        },
        {
            title: t('landing.navbar.books.computerBooks'),
            to: AppRoute.book.books.url,
            search: { category: '[6]' },
            description: t('landing.navbar.books.descriptions.computerBooks')
        },
        {
            title: t('landing.navbar.books.literatureBooks'),
            to: AppRoute.book.books.url,
            search: { category: '[7]' },
            description: t('landing.navbar.books.descriptions.literatureBooks')
        },
    ], [t])

    const constitutionMenu = useMemo<MenuItem[]>(() => [
        {
            title: t('landing.navbar.constitution.pancasila'),
            to: AppRoute.constitution.pancasila.url,
            description: t('landing.navbar.constitution.descriptions.pancasila')
        },
        {
            title: t('landing.navbar.constitution.pembukaanUud1945'),
            to: AppRoute.constitution.pembukaanUud1945.url,
            description: t('landing.navbar.constitution.descriptions.pembukaanUud1945')
        },
        {
            title: t('landing.navbar.constitution.butirPancasila'),
            to: AppRoute.constitution.butirPancasila.url,
            description: t('landing.navbar.constitution.descriptions.butirPancasila')
        },
        {
            title: t('landing.navbar.constitution.uud1945'),
            to: AppRoute.constitution.uud1945.url,
            description: t('landing.navbar.constitution.descriptions.uud1945')
        },
        {
            title: t('landing.navbar.constitution.uud1945Asli'),
            to: AppRoute.constitution.uud1945Asli.url,
            description: t('landing.navbar.constitution.descriptions.uud1945Asli')
        },
        {
            title: t('landing.navbar.constitution.amandemen'),
            to: AppRoute.constitution.amandemen.url,
            description: t('landing.navbar.constitution.descriptions.amandemen')
        },
    ], [t])

    const tablePeriodicMenu = useMemo<MenuItem[]>(() => [
        {
            title: t('landing.navbar.periodicTable.periodicTable'),
            to: AppRoute.periodicTable.periodicTable.url,
            description: t('landing.navbar.periodicTable.descriptions.periodicTable')
        },
        {
            title: t('landing.navbar.periodicTable.element'),
            to: AppRoute.periodicTable.elementDetail.url,
            params: { id: '1' },
            description: t('landing.navbar.periodicTable.descriptions.element')
        },
        {
            title: t('landing.navbar.periodicTable.elementIsotope'),
            to: AppRoute.periodicTable.elementIsotope.url,
            params: { id: '1' },
            description: t('landing.navbar.periodicTable.descriptions.elementIsotope')
        },
        {
            title: t('landing.navbar.periodicTable.elementComparison'),
            to: AppRoute.periodicTable.elementComparison.url,
            description: t('landing.navbar.periodicTable.descriptions.elementComparison')
        },
        {
            title: t('landing.navbar.periodicTable.chemistryDictionary'),
            to: AppRoute.periodicTable.chemistryDictionary.url,
            description: t('landing.navbar.periodicTable.descriptions.chemistryDictionary')
        },
    ], [t])

    const quizMenu = useMemo<MenuItem[]>(() => [
        {
            title: t('landing.navbar.quiz.semester'),
            to: '/quiz/semester',
            description: t('landing.navbar.quiz.descriptions.semester')
        },
        {
            title: t('landing.navbar.quiz.subjects'),
            to: '/quiz/subjects',
            description: t('landing.navbar.quiz.descriptions.subjects')
        },
        {
            title: t('landing.navbar.quiz.national'),
            to: '/quiz/national',
            description: t('landing.navbar.quiz.descriptions.national')
        },
        {
            title: t('landing.navbar.quiz.utbk'),
            to: '/quiz/utbk',
            description: t('landing.navbar.quiz.descriptions.utbk')
        },
        {
            title: t('landing.navbar.quiz.cpns'),
            to: '/quiz/cpns',
            description: t('landing.navbar.quiz.descriptions.cpns')
        },
        {
            title: t('landing.navbar.quiz.umptn'),
            to: '/quiz/umptn',
            description: t('landing.navbar.quiz.descriptions.umptn')
        },
    ], [t])

    return {
        booksMenu,
        constitutionMenu,
        tablePeriodicMenu,
        quizMenu
    }
}
