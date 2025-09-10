import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProducts } from "@/redux/actions/user/userProductActions";
import { useNavigate, useSearchParams } from "react-router-dom";
import JustLoading from "../JustLoading";
import ProductCard2 from "../Cards/ProductCard2";
import min50 from "../../assets/minofff.png";
import minofflg from "../../assets/minofflg.jpeg";

const shuffleArray = (array) => {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const OurProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProducts, loading } = useSelector((state) => state.userProducts);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserProducts(searchParams));
  }, [searchParams]);

  return (
    <div className="bg-white py-10" data-aos="fade-up">
      {/* Product Cards Section */}
      <div className="rounded-[30px] p-6 sm:p-10 max-w-7xl mx-auto">
        <div>
          <h1 className="text-[#065c63] text-2xl sm:text-xl md:text-3xl font-bold mb-2">
            POPULAR ITEMS
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <JustLoading size={10} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {userProducts && userProducts.length > 0 ? (
              shuffleArray(userProducts)
                .slice(0, 12)
                .map((product, index) => (
                  // The wrapping div has been removed. key is now on ProductCard2
                  <ProductCard2 key={index} product={product} />
                ))
            ) : (
              <div className="h-96 flex items-center justify-center col-span-full">
                <p>Nothing to show</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate(`/collections`)}
            className="bg-[#00bfa6] hover:bg-[#00a897] text-white px-8 py-2 rounded-full text-sm font-semibold shadow-md flex items-center"
          >
            VIEW MORE
          </button>
        </div>
      </div>

      {/* 🎯 Large screen fancy promo */}
      <div className="hidden lg:block relative mt-20w-full bg-[#165e6b] overflow-visible px-20">
        <div className="max-w-7xl mx-auto relative">
          {/* Text background box */}
          <div className="bg-[#165e6b] rounded-2xl py-6 px-6 flex justify-end relative z-10">
            <div className="text-white w-3/5">
              <h2 className="text-4xl xl:text-6xl font-semibold mb-2">MIN.</h2>
              <h3 className="text-5xl xl:text-7xl font-bold mb-4">50% OFF*</h3>
              <p className="text-sm xl:text-base tracking-wide">
                TERMS AND CONDITIONS APPLY
              </p>
            </div>
          </div>

          {/* Floating image */}
          <div className="absolute  -top-8 z-20">
            <img
              src={minofflg}
              alt="Promo"
              className="w-[260px] xl:w-[340px] transform -rotate-[5deg] drop-shadow-2xl px-2"
              style={{ width: '220px', height: '300px',marginLeft:'100px'}}
            />
          </div>
        </div>
      </div>

      {/* 📱 Mobile version */}
      <div className="block lg:hidden bg-[#165e6b] py-10 px-6 flex flex-col md:flex-row items-center justify-between mt-12">
        <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
          <img
            src={min50}
            alt="Promo"
            className="w-[300px] md:w-[350px] object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 text-white text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-semibold mb-2">MIN.</h2>
          <h3 className="text-4xl md:text-6xl font-bold mb-4">50% OFF*</h3>
          <p className="text-xs">TERMS AND CONDITIONS APPLY</p>
        </div>
      </div>
    </div>
  );
};

export default OurProducts;