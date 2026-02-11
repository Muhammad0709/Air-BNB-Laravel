import React from 'react'
import HorizontalScrollSection from './HorizontalScrollSection'
import { useLanguage } from '../hooks/use-language'

type PropertyItem = {
  id?: number | string
  image: string
  title: string
  location: string
  price: number
  rating?: number
  reviews?: number
  isGuestFavorite?: boolean
}

type PopularStaysProps = {
  items?: PropertyItem[]
}

export default function PopularStays({ items = [] }: PopularStaysProps) {
  const { t } = useLanguage()
  return (
    <section className="popular-stays">
      <HorizontalScrollSection
        title={t('home.popular')}
        items={items}
        emptyMessage={t('home.no_popular')}
        emptySubtext={t('home.no_popular_sub')}
      />
    </section>
  )
}


