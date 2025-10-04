import { URL } from "@/Common/api";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const ProductCard2 = ({ product, isWishlisted, onToggleWishlist, showWishlistOnHover = false }) => {
  const navigate = useNavigate();
  const originalPrice = Number(product.markup) || 0;

  return (
    <div className="cursor-pointer space-y-3 relative group">
      {/* Card content */}
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="aspect-[3/4] w-full overflow-hidden relative"
      >
        <img
          src={`${URL}/img/${product?.imageURL}`}
          alt={product.name}
          className="h-full w-full object-cover rounded-[20px] transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist Icon */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onToggleWishlist(product);
            }}
            className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full z-10
              ${
                showWishlistOnHover
                  ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  : "opacity-100"
              }
              ${isWishlisted ? "bg-teal-600 text-white" : "border border-teal-600 text-teal-600"}
            `}
          >
            <Heart fill={isWishlisted ? "white" : "none"} size={16} />
          </button>
        )}
      </div>

      {/* Centered Text */}
      <div className="space-y-2 text-center">
        <h3
          className="text-sm font-medium uppercase tracking-wide cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product._id}`);
          }}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description ||
            "Contrary to popular belief, Lorem Ipsum is not simply random text."}
        </p>
        
        {/* MODIFIED PRICE BLOCK WITH RESPONSIVE FONT SIZES */}
        <div className="flex items-center justify-center gap-2">
          {originalPrice > product.price ? (
            <>
              {/* text-sm on mobile, text-lg on larger screens */}
              <span className="text-sm sm:text-lg font-semibold line-through text-gray-500">
                ₹{originalPrice.toLocaleString()}
              </span>
              <span className="text-sm sm:text-lg font-semibold text-red-500">
                From ₹{product.price.toLocaleString()}
              </span>
            </>
          ) : (
            // text-sm on mobile, text-lg on larger screens
            <span className="text-sm sm:text-lg font-semibold text-red-500">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard2;
