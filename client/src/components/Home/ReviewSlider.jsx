import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const reviews = [
  {
    name: 'Sarah M.',
    message: "I'm blown away by the quality and style of the clothes I received from Sagey. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
    rating: 5
  },
  {
    name: 'Alex K.',
    message: "Finding clothes that align with my personal style used to be a challenge until I discovered Sagey. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
    rating: 5
  },
  {
    name: 'James L.',
    message: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Sagey. The selection of clothes is not only diverse but also on-point with the latest trends.",
    rating: 5
  },
  {
    name: 'Emily R.',
    message: "Sagey has completely transformed my wardrobe. The attention to detail in their designs and the quality of their materials is second to none. Highly recommend!",
    rating: 5
  },
  {
    name: 'Michael B.',
    message: "I've tried several online stores, but none compare to Sagey. Their delivery is quick, and the clothes fit perfectly every time. A loyal customer for life!",
    rating: 5
  },
  {
    name: 'Sophia H.',
    message: "The customer service at Sagey is incredible! They helped me find the right size and style, and the clothes look amazing. Great experience overall!",
    rating: 5
  },
  {
    name: 'David T.',
    message: "Sagey is my go-to for trendy and affordable clothing. Every time I shop here, I'm impressed by how stylish and comfortable the clothes are.",
    rating: 4
  },
  {
    name: 'Olivia W.',
    message: "I love how Sagey keeps their collection fresh and exciting. It feels like they always have something new for me to try. Fantastic variety!",
    rating: 5
  },
  {
    name: 'Chris P.',
    message: "Sagey offers unbeatable value for money. The quality of their clothing rivals high-end brands, but the prices are super reasonable.",
    rating: 5
  }
]

function ReviewSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 ">
      <Header />
      <div className="relative mt-10 max-w-full mx-auto">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {reviews.map((review, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 pl-1 sm:pl-2 md:flex-[0_0_33.33%] lg:flex-[0_0_16.66%]">
                <Review review={review} />
              </div>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous review</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next review</span>
        </Button>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="text-start px-3 sm:px-12 mt-4">
     <h1 className="text-xl sm:text-xl md:text-xl text-[#065c63] sm:font-bold md:font-bold">
      CUSTOMER REVIEWS
      </h1>
      {/* <div className='h-1 w-24 bg-primary mt-1'></div> */}
    </div>
  )
}

function Review({ review }) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* <Avatar>
            <AvatarImage src={`https://ui-avatars.com/api/?name=${review.name}&background=0D8ABC&color=fff`} alt={review.name} />
            <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar> */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-900">{review.name}</h3>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">{review.message}</p>
      </CardContent>
    </Card>
  )
}

export default ReviewSlider
