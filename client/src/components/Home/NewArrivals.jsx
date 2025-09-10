import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard2 from "../Cards/ProductCard2";
import { useDispatch, useSelector } from "react-redux";
import { getUserProducts } from "@/redux/actions/user/userProductActions";
import { useNavigate, useSearchParams } from "react-router-dom";
import JustLoading from "../JustLoading";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";

import top from '../../assets/topp.svg';
import dress from '../../assets/dress.svg';
import romper from '../../assets/ethnic.svg';
import kneelength from '../../assets/kneelength.svg';

const categories = [
  { label: "TOPS", icon: top, category: "TOPS" },
  { label: "GAWON", icon: dress, category: "GAWON" },
  { label: "ROMPER", icon: romper, category: "ROMPER" },
  { label: "KNEE LENGTH", icon: kneelength, category: "KNEELENGTH" },
];

// To enable looping when all items are visible, we duplicate the array.
const loopedCategories = categories.length > 0 ? [...categories, ...categories] : [];

const NewArrivals = () => {
  const [wishlist, setWishlist] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProducts, loading } = useSelector((state) => state.userProducts);
  const dispatch = useDispatch();
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start' 
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const toggleWishlist = (product) => {
    setWishlist((prev) =>
      prev.some((item) => item._id === product._id)
        ? prev.filter((item) => item._id !== product._id)
        : [...prev, product]
    );
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });

    dispatch(getUserProducts(searchParams));
  }, [searchParams, dispatch]);

  return (
    <div className="bg-[#065c63] px-4 py-10" id="newArrival" data-aos="fade-up">
      <div className="bg-white rounded-[30px] p-6 sm:p-10 max-w-7xl mx-auto shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#065c63] text-2xl sm:text-xl md:text-3xl font-bold mb-6">
              NEW ARRIVALS
            </h1>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <JustLoading size={10} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userProducts && userProducts.length > 0 ? (
                userProducts.slice(0, 4).map((product, index) => (
                  <ProductCard2
                    key={index}
                    product={product}
                    isWishlisted={wishlist.some((item) => item._id === product._id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))
              ) : (
                <div className="h-96 flex items-center justify-center col-span-full">
                  <p>Nothing to show</p>
                </div>
              )}
            </div>

            {/* View More Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate(`/collections`)}
                className="bg-[#00bfa6] hover:bg-[#00a897] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md"
              >
                VIEW MORE
              </button>
            </div>
          </>
        )}
      </div>

      {/* Category Slider */}
      <div className="mt-8 px-4 py-12">
        <div className="relative max-w-7xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {loopedCategories.map((item, index) => (
                <div
                  key={index}
                  // Shows 2 on mobile, 3 on tablet, 4 on large screens
                  className="flex-[0_0_50%] min-w-0 pl-4 md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"
                >
                  <div
                    onClick={() => navigate(`/collections?search=${item.category}`)}
                    className="flex flex-col items-center justify-center bg-white rounded-[25px] p-5 w-full h-full hover:scale-105 transition-transform duration-300 cursor-pointer shadow-md"
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-10 h-10 mb-2"
                    />
                    <p className="text-[#065c63] text-sm font-semibold text-center">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Navigation Buttons visible on all screens */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full z-10"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Category</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full z-10"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Category</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;