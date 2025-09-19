import React from "react";
import { URL } from "../../../Common/api";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";

const OrderDetailsProductRow = ({
  length,
  index,
  item,
  status,
  toggleReviewModal,
}) => {
  const isLast = index === length - 1;
  const classes = isLast ? "p-3 sm:p-4" : "p-3 sm:p-4 border-b border-gray-200";
  return (
    <tr className={classes}>
      <td className="admin-table-row">
        <div className="flex items-start sm:items-center gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 overflow-clip flex justify-center items-center shrink-0 rounded-md">
            {item.productId.imageURL ? (
              <img
                src={`${URL}/img/${item.productId.imageURL}`}
                alt="img"
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-300 rounded-md"></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link to={`/product/${item.productId._id}`}>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-blue-600 line-clamp-2 hover:underline cursor-pointer">
                {item.productId.name}
              </p>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">{item.productId.description}</p>
            {/* Displaying attributes */}
            {item.attributes && (
              <div className="text-xs text-gray-500 mt-1">
                {Object.entries(item.attributes).map(([key, value]) => (
                  <p key={key} className="truncate">
                    <span className="font-medium">{key}:</span> {value}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="admin-table-row text-center text-sm sm:text-base font-medium">
        ₹{item.price + item.markup}
      </td>
      <td className="admin-table-row text-center text-sm sm:text-base font-medium">
        {item.quantity}
      </td>
      <td className="admin-table-row text-center text-sm sm:text-base font-semibold">
        ₹{(item.price + item.markup) * item.quantity}
      </td>
      {status !== "pending" &&
        status !== "processing" &&
        status !== "shipped" && (
          <td className="text-center">
            <p
              className="font-semibold flex items-center justify-center gap-1 text-blue-400 cursor-pointer hover:bg-blue-100 p-2 rounded-lg text-xs sm:text-sm whitespace-nowrap"
              onClick={() => toggleReviewModal(item.productId)}
            >
              <span className="hidden sm:inline">Leave a Review</span>
              <span className="sm:hidden">Review</span>
              <BiMessageSquareDetail className="text-sm" />
            </p>
          </td>
        )}
    </tr>
  );
};

export default OrderDetailsProductRow;
