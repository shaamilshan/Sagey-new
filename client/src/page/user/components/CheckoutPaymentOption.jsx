import React from "react";
import { GiPayMoney } from "react-icons/gi";

const CheckoutPaymentOption = ({
  selectedPayment,
  handleSelectedPayment,
}) => {
  return (
    <>
      <div className="flex items-center justify-center py-5">
        <label className="cursor-pointer" htmlFor="cashOnDelivery">
          <div className="border shadow-md p-5 flex flex-col items-center rounded-lg mr-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <GiPayMoney className="text-2xl" />
            </div>
            <p className="mb-2 text-md font-bold">Cash On Delivery</p>
            <p className="text-xs text-gray-600 mb-2">+₹200 COD Fee</p>
            <input
              type="radio"
              name="paymentMode"
              id="cashOnDelivery"
              value="cashOnDelivery"
              onChange={handleSelectedPayment}
              checked={selectedPayment === "cashOnDelivery"}
            />
          </div>
        </label>
        <label className="cursor-pointer" htmlFor="razorPay">
          <div className="border-r px-5 flex flex-col items-center">
            <div className="w-10 h-10">
              <img
                src="https://d6xcmfyh68wv8.cloudfront.net/assets/razorpay-glyph.svg"
                alt="Razor Pay Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="mb-2 text-sm">Razor Pay</p>
            <input
              type="radio"
              name="paymentMode"
              id="razorPay"
              value="razorPay"
              onChange={handleSelectedPayment}
              checked={selectedPayment === "razorPay"}
            />
          </div>
        </label>
      </div>
    </>
  );
};

export default CheckoutPaymentOption;