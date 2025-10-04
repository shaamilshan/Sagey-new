import React from "react";
import { GiPayMoney } from "react-icons/gi";

const CheckoutPaymentOption = ({
  selectedPayment,
  handleSelectedPayment,
}) => {
  return (
    <>
      <div className="flex items-stretch justify-center py-5 gap-4 sm:gap-6">
        {/* Cash On Delivery Option */}
        <label
          htmlFor="cashOnDelivery"
          className={`
            cursor-pointer border rounded-lg p-4 sm:p-5 flex-1 text-center transition-all duration-200
            ${
              selectedPayment === "cashOnDelivery"
                ? "border-teal-600 shadow-lg scale-105 bg-teal-50" // Selected style
                : "border-gray-200 hover:border-gray-400"      // Default style
            }
          `}
        >
          <div className="w-10 h-10 mx-auto flex items-center justify-center">
            <GiPayMoney className="text-2xl" />
          </div>
          <p className="mb-2 mt-2 text-sm sm:text-base font-bold">Cash On Delivery</p>
          <p className="text-xs text-gray-600 mb-2">+₹100 COD Fee</p>
          <input
            type="radio"
            name="paymentMode"
            id="cashOnDelivery"
            value="cashOnDelivery"
            onChange={handleSelectedPayment}
            checked={selectedPayment === "cashOnDelivery"}
            className="mt-2 accent-teal-600"
          />
        </label>

        {/* Razor Pay Option */}
        <label
          htmlFor="razorPay"
          className={`
            cursor-pointer border rounded-lg p-4 sm:p-5 flex-1 text-center transition-all duration-200
            ${
              selectedPayment === "razorPay"
                ? "border-teal-600 shadow-lg scale-105 bg-teal-50" // Selected style
                : "border-gray-200 hover:border-gray-400"      // Default style
            }
          `}
        >
          <div className="w-10 h-10 mx-auto">
            <img
              src="https://d6xcmfyh68wv8.cloudfront.net/assets/razorpay-glyph.svg"
              alt="Razor Pay Icon"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="mb-2 mt-2 text-sm sm:text-base font-bold">Razor Pay</p>
          {/* This invisible text helps keep both boxes the same height */}
          <p className="text-xs text-transparent mb-2">Online Payment</p>
          <input
            type="radio"
            name="paymentMode"
            id="razorPay"
            value="razorPay"
            onChange={handleSelectedPayment}
            checked={selectedPayment === "razorPay"}
            className="mt-2 accent-teal-600"
          />
        </label>
      </div>
    </>
  );
};

export default CheckoutPaymentOption;