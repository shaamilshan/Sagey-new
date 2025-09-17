import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { URL } from '../../../Common/api';
import { config } from '../../../Common/configurations';
import toast from 'react-hot-toast';

const OrderTracking = ({ order }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const trackOrder = async () => {
    if (!order.delhivery?.waybill) {
      toast.error('Tracking information not available');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${URL}/user/shipping/track/${order.delhivery.waybill}`,
        config
      );

      if (response.data.success) {
        setTrackingData(response.data.data);
      } else {
        toast.error('Unable to fetch tracking information');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Unable to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order.delhivery?.waybill) {
      trackOrder();
    }
  }, [order.delhivery?.waybill]);

  if (!order.delhivery?.waybill) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Shipping Information</h3>
        <p className="text-gray-600">Tracking information will be available once the order is shipped.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Track Your Order</h3>
        <button
          onClick={trackOrder}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* Delhivery Information */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Waybill:</span>
            <p className="text-blue-600">{order.delhivery.waybill}</p>
          </div>
          <div>
            <span className="font-medium">Shipping Method:</span>
            <p>{order.delhivery.shippingMethod || 'Standard'}</p>
          </div>
          <div>
            <span className="font-medium">Expected Delivery:</span>
            <p>{order.delhivery.expectedDeliveryDays || '3-5'} business days</p>
          </div>
          <div>
            <span className="font-medium">Tracking URL:</span>
            {order.delhivery.trackingUrl ? (
              <a
                href={order.delhivery.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Track on Delhivery
              </a>
            ) : (
              <p>Not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Status */}
      {trackingData && (
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-800">Current Status</h4>
            <p className="text-lg font-semibold text-blue-600">
              {trackingData.status || order.delhivery.shipmentStatus || 'Processing'}
            </p>
            {trackingData.location && (
              <p className="text-gray-600">Location: {trackingData.location}</p>
            )}
          </div>

          {/* Tracking History */}
          {trackingData.scans && trackingData.scans.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Tracking History</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {trackingData.scans.map((scan, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium">{scan.ScanDetail.ScanDateTime}</p>
                      <p className="text-gray-700">{scan.ScanDetail.Scan}</p>
                      <p className="text-sm text-gray-500">{scan.ScanDetail.ScanType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          {trackingData.delivered_date && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <h4 className="font-medium text-green-800">Delivered</h4>
              <p className="text-green-700">
                Delivered on {new Date(trackingData.delivered_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tracking information...</span>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;