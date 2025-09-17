import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { URL } from '../../../Common/api';
import { config } from '../../../Common/configurations';
import toast from 'react-hot-toast';

const ShippingCalculator = ({ selectedAddress, onShippingUpdate }) => {
  const [shippingRates, setShippingRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('surface');
  const [pincodeServiceability, setPincodeServiceability] = useState(null);
  
  const { cart } = useSelector((state) => state.cart);

  // Calculate total weight based on cart items (assuming 0.5kg per item)
  const calculateWeight = () => {
    return cart.reduce((weight, item) => {
      return weight + (item.quantity * 0.5);
    }, 0);
  };

  // Check pincode serviceability
  const checkServiceability = async (pincode) => {
    try {
      const response = await axios.get(
        `${URL}/user/shipping/pincode/${pincode}`,
        config
      );
      
      if (response.data.success) {
        setPincodeServiceability(response.data.data);
        return response.data.data.serviceable;
      }
      return false;
    } catch (error) {
      console.error('Error checking pincode serviceability:', error);
      toast.error('Unable to check pincode serviceability');
      return false;
    }
  };

  // Calculate shipping rates
  const calculateShippingRates = async () => {
    if (!selectedAddress || !selectedAddress.pinCode) {
      return;
    }

    setLoading(true);
    
    try {
      // First check if pincode is serviceable
      const isServiceable = await checkServiceability(selectedAddress.pinCode);
      
      if (!isServiceable) {
        toast.error('Delivery not available to this pincode');
        setLoading(false);
        return;
      }

      const weight = calculateWeight();
      const requestData = {
        toPincode: selectedAddress.pinCode.toString(),
        weight: weight,
        cod: false // This will be updated based on payment method
      };

      const response = await axios.post(
        `${URL}/user/shipping/calculate-rates`,
        requestData,
        config
      );

      if (response.data.success) {
        setShippingRates(response.data.data);
        // Default to surface shipping
        const defaultShipping = response.data.data.surface;
        onShippingUpdate({
          method: 'surface',
          rate: defaultShipping.rate,
          codCharges: defaultShipping.cod_charges,
          deliveryDays: defaultShipping.delivery_days,
          totalShipping: defaultShipping.rate + defaultShipping.fuel_surcharge
        });
      }
    } catch (error) {
      console.error('Error calculating shipping rates:', error);
      toast.error('Unable to calculate shipping rates');
      // Set fallback rates
      const fallbackRates = {
        surface: {
          rate: 50,
          cod_charges: 0,
          fuel_surcharge: 10,
          delivery_days: '3-5'
        },
        express: {
          rate: 80,
          cod_charges: 0,
          fuel_surcharge: 15,
          delivery_days: '1-2'
        }
      };
      setShippingRates(fallbackRates);
      onShippingUpdate({
        method: 'surface',
        rate: 50,
        codCharges: 0,
        deliveryDays: '3-5',
        totalShipping: 60
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle shipping method change
  const handleShippingMethodChange = (method) => {
    setSelectedShippingMethod(method);
    if (shippingRates && shippingRates[method]) {
      const selectedRate = shippingRates[method];
      onShippingUpdate({
        method: method,
        rate: selectedRate.rate,
        codCharges: selectedRate.cod_charges,
        deliveryDays: selectedRate.delivery_days,
        totalShipping: selectedRate.rate + selectedRate.fuel_surcharge
      });
    }
  };

  // Recalculate when address changes
  useEffect(() => {
    if (selectedAddress && selectedAddress.pinCode) {
      calculateShippingRates();
    }
  }, [selectedAddress]);

  if (!selectedAddress) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
        <p className="text-yellow-800">Please select a delivery address to calculate shipping rates.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-5 rounded mb-4">
        <h3 className="text-lg font-semibold mb-3">Shipping Options</h3>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="ml-2">Calculating shipping rates...</span>
        </div>
      </div>
    );
  }

  if (pincodeServiceability && !pincodeServiceability.serviceable) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Delivery Not Available</h3>
        <p className="text-red-700">Sorry, we don't deliver to pincode {selectedAddress.pinCode} at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded mb-4">
      <h3 className="text-lg font-semibold border-b pb-2 mb-3">Shipping Options</h3>
      
      {pincodeServiceability && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-sm">
            ✓ Delivery available to {selectedAddress.city}, {selectedAddress.regionState} - {selectedAddress.pinCode}
          </p>
          {pincodeServiceability.cod && (
            <p className="text-green-700 text-sm">✓ Cash on Delivery available</p>
          )}
        </div>
      )}

      {shippingRates && (
        <div className="space-y-3">
          {/* Surface Shipping */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedShippingMethod === 'surface' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleShippingMethodChange('surface')}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="shippingMethod"
                value="surface"
                checked={selectedShippingMethod === 'surface'}
                onChange={() => handleShippingMethodChange('surface')}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Standard Delivery</h4>
                    <p className="text-sm text-gray-600">
                      Delivered in {shippingRates.surface.delivery_days} business days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{shippingRates.surface.rate + shippingRates.surface.fuel_surcharge}
                    </p>
                    {shippingRates.surface.fuel_surcharge > 0 && (
                      <p className="text-xs text-gray-500">
                        (Base: ₹{shippingRates.surface.rate} + Fuel: ₹{shippingRates.surface.fuel_surcharge})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Express Shipping */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedShippingMethod === 'express' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleShippingMethodChange('express')}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="shippingMethod"
                value="express"
                checked={selectedShippingMethod === 'express'}
                onChange={() => handleShippingMethodChange('express')}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Express Delivery</h4>
                    <p className="text-sm text-gray-600">
                      Delivered in {shippingRates.express.delivery_days} business days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{shippingRates.express.rate + shippingRates.express.fuel_surcharge}
                    </p>
                    {shippingRates.express.fuel_surcharge > 0 && (
                      <p className="text-xs text-gray-500">
                        (Base: ₹{shippingRates.express.rate} + Fuel: ₹{shippingRates.express.fuel_surcharge})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;