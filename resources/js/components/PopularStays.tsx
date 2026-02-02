import React from 'react'
import HorizontalScrollSection from './HorizontalScrollSection'
// Images served from public directory
const img1 = '/images/popular-stay-1.svg'
const img2 = '/images/popular-stay-2.svg'
const img3 = '/images/popular-stay-3.svg'
const filter1 = '/images/filter-1.svg'
const filter2 = '/images/filter-2.svg'
const filter3 = '/images/filter-3.svg'

export default function PopularStays() {
  const items = [
    { image: img1, title: 'Luxury Beachfront Villa', location: 'Malibu, California', price: 299, rating: 4.93, reviews: 123, isGuestFavorite: true },
    { image: img2, title: 'Modern Downtown Apartment', location: 'Los Angeles, California', price: 189, rating: 4.87, reviews: 89, isGuestFavorite: false },
    { image: img3, title: 'Cozy Mountain Cabin', location: 'Lake Tahoe, California', price: 249, rating: 4.95, reviews: 156, isGuestFavorite: true },
    { image: filter1, title: 'Beachside Condo', location: 'San Diego, California', price: 179, rating: 4.82, reviews: 67, isGuestFavorite: false },
    { image: filter2, title: 'Luxury Beachfront Villa', location: 'Malibu, California', price: 299, rating: 4.91, reviews: 134, isGuestFavorite: true },
    { image: filter3, title: 'City Center Loft', location: 'San Francisco, California', price: 219, rating: 4.88, reviews: 98, isGuestFavorite: false },
    { image: img1, title: 'Ocean View Penthouse', location: 'Santa Monica, California', price: 349, rating: 4.96, reviews: 201, isGuestFavorite: true },
    { image: img2, title: 'Historic Victorian Home', location: 'San Francisco, California', price: 279, rating: 4.89, reviews: 112, isGuestFavorite: false },
    { image: img3, title: 'Desert Oasis Retreat', location: 'Palm Springs, California', price: 229, rating: 4.84, reviews: 78, isGuestFavorite: false },
    { image: filter1, title: 'Wine Country Estate', location: 'Napa Valley, California', price: 399, rating: 4.97, reviews: 167, isGuestFavorite: true },
  ]

  return (
    <section className="popular-stays">
      <HorizontalScrollSection 
        title="Popular"
        items={items}
      />
    </section>
  )
}


