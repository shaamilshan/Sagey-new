import { URL } from "@/Common/api";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const ProductCard2 = ({ product, isWishlisted, onToggleWishlist, showWishlistOnHover = false }) => {
  const navigate = useNavigate();
  const originalPrice = product.markup || 0;

  return (
    <div className="cursor-pointer space-y-3 relative group">
      {/* Card content - now this div will be the relative parent for the icon */}
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="aspect-[3/4] w-full overflow-hidden relative" // Added 'relative' here!
      >
        <img
          src={`${URL}/img/${product?.imageURL}`}
          alt={product.name}
          className="h-full w-full object-cover rounded-[20px] transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist Icon - now positioned relative to the image wrapper */}
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
        <h3 className="text-sm font-medium uppercase tracking-wide">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description ||
            "Contrary to popular belief, Lorem Ipsum is not simply random text."}
        </p>
        
        <div className="flex items-center justify-center gap-2">
          {originalPrice > 0 ? (
            <>
              <span className="text-lg font-semibold line-through">
                ₹{originalPrice}
              </span>
              <span className="text-sm text-gray-500">From</span>
              <span className="text-lg font-semibold text-red-500">
                ₹{product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold text-red-500">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard2;