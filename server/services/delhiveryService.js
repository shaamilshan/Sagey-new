const axios = require('axios');

class DelhiveryService {
  constructor() {
    this.baseURL = 'https://track.delhivery.com/api';
    this.stagingURL = 'https://staging-express.delhivery.com/api';
    this.apiKey = process.env.DELHIVERY_API_KEY;
    this.useStaging = process.env.DELHIVERY_USE_STAGING === 'true';
    this.pickupLocation = {
      name: process.env.PICKUP_LOCATION_NAME || 'Sagey Warehouse',
      address: process.env.PICKUP_ADDRESS || 'Default Address',
      city: process.env.PICKUP_CITY || 'Mumbai',
      state: process.env.PICKUP_STATE || 'Maharashtra',
      pincode: process.env.PICKUP_PINCODE || '400001',
      phone: process.env.PICKUP_PHONE || '9999999999'
    };
  }

  // Get the appropriate base URL
  getApiUrl() {
    return this.useStaging ? this.stagingURL : this.baseURL;
  }

  // Check if pincode is serviceable
  async checkPincodeServiceability(pincode) {
    try {
      const response = await axios.get(
        `https://track.delhivery.com/c/api/pin-codes/json/`,
        {
          params: {
            token: this.apiKey,
            filter_codes: pincode
          }
        }
      );

      if (response.data && response.data.delivery_codes) {
        const pincodeData = response.data.delivery_codes.find(
          code => code.postal_code.pin === parseInt(pincode)
        );
        
        return {
          serviceable: !!pincodeData,
          cod: pincodeData ? pincodeData.postal_code.cod === 'Y' : false,
          prepaid: pincodeData ? pincodeData.postal_code.pre_paid === 'Y' : false,
          city: pincodeData ? pincodeData.postal_code.district : null,
          state: pincodeData ? pincodeData.postal_code.state_code : null
        };
      }

      return { serviceable: false };
    } catch (error) {
      console.error('Error checking pincode serviceability:', error.message);
      throw new Error('Unable to check pincode serviceability');
    }
  }

  // Calculate shipping rates
  async calculateShippingRate(fromPincode, toPincode, weight = 0.5, cod = false) {
    try {
      // Try the rate calculation endpoint with proper format
      const response = await axios.get(
        `${this.getApiUrl()}/kinko/v1/invoice/charges/.json`,
        {
          params: {
            token: this.apiKey,
            md: 'S', // Mode: Surface
            ss: 'RTO', // Service type
            d_pin: toPincode,
            o_pin: fromPincode,
            cgm: Math.round(weight * 1000), // Convert kg to grams
            pt: cod ? 'COD' : 'Pre-paid',
            cod: cod ? 1 : 0
          }
        }
      );

      if (response.data && response.data[0]) {
        const rateData = response.data[0];
        return {
          surface: {
            rate: parseFloat(rateData.total_amount || 0),
            cod_charges: parseFloat(rateData.cod_charges || 0),
            fuel_surcharge: parseFloat(rateData.fuel_surcharge || 0),
            delivery_days: '3-5'
          },
          express: {
            rate: parseFloat(rateData.total_amount || 0) * 1.5, // Approximate express rate
            cod_charges: parseFloat(rateData.cod_charges || 0),
            fuel_surcharge: parseFloat(rateData.fuel_surcharge || 0),
            delivery_days: '1-2'
          }
        };
      }

      throw new Error('No rate data received');
    } catch (error) {
      console.error('Error calculating shipping rate:', error.message);
      if (error.response) {
        console.error('Rate API Response status:', error.response.status);
        console.error('Rate API Response data:', error.response.data);
      }
      
      // Return fallback rates on error (as per memory requirements)
      console.log('Using fallback shipping rates');
      return {
        surface: {
          rate: weight <= 0.5 ? 50 : 100,
          cod_charges: cod ? 40 : 0,
          fuel_surcharge: 10,
          delivery_days: '3-5'
        },
        express: {
          rate: weight <= 0.5 ? 80 : 150,
          cod_charges: cod ? 40 : 0,
          fuel_surcharge: 15,
          delivery_days: '1-2'
        }
      };
    }
  }

  // Create shipment/book order
  async createShipment(orderData) {
    try {
      const shipmentData = {
        shipments: [{
          name: `${orderData.address.firstName} ${orderData.address.lastName}`,
          add: orderData.address.address,
          pin: orderData.address.pinCode.toString(),
          city: orderData.address.city,
          state: orderData.address.regionState,
          country: orderData.address.country || 'India',
          phone: orderData.address.phoneNumber,
          order: orderData.orderId || orderData._id,
          payment_mode: orderData.paymentMode === 'cashOnDelivery' ? 'COD' : 'Prepaid',
          return_pin: this.pickupLocation.pincode,
          return_city: this.pickupLocation.city,
          return_phone: this.pickupLocation.phone,
          return_add: this.pickupLocation.address,
          return_state: this.pickupLocation.state,
          return_country: 'India',
          products_desc: orderData.products.map(p => 
            `${p.productId.name || 'Product'} x ${p.quantity}`
          ).join(', '),
          hsn_code: '',
          cod_amount: orderData.paymentMode === 'cashOnDelivery' ? orderData.totalPrice.toString() : '',
          order_date: new Date().toISOString().split('T')[0],
          total_amount: orderData.totalPrice.toString(),
          seller_add: this.pickupLocation.address,
          seller_name: this.pickupLocation.name,
          seller_inv: '',
          quantity: orderData.totalQuantity.toString() || '1',
          waybill: '',
          shipment_width: '10',
          shipment_height: '10',
          weight: (orderData.weight || 500).toString(), // Default 500 grams
          seller_gst_tin: '',
          shipping_mode: 'Surface',
          address_type: 'home'
        }],
        pickup_location: {
          name: this.pickupLocation.name
        }
      };

      // Format data as form-encoded string as shown in the example
      const formData = `format=json&data=${JSON.stringify(shipmentData)}`;

      console.log('Creating Delhivery shipment for order:', orderData.orderId || orderData._id);
      console.log('Using pickup location:', this.pickupLocation.name);
      console.log('API URL:', `${this.getApiUrl()}/cmu/create.json`);

      const response = await axios.post(
        `${this.getApiUrl()}/cmu/create.json`,
        formData,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000 // Increase timeout
        }
      );

      console.log('Delhivery response status:', response.status);
      console.log('Delhivery response data:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success) {
        return {
          success: true,
          waybill: response.data.packages?.[0]?.waybill,
          package_id: response.data.packages?.[0]?.refnum,
          status: response.data.packages?.[0]?.status
        };
      }

      return {
        success: false,
        error: response.data?.rmk || 'Failed to create shipment'
      };
    } catch (error) {
      console.error('Error creating shipment:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      // Handle specific error cases
      let errorMessage = error.response?.data?.rmk || error.message || 'Unable to create shipment';
      
      if (errorMessage.includes('ClientWarehouse matching query does not exist')) {
        errorMessage = `Pickup location "${this.pickupLocation.name}" not found in Delhivery account. Please contact Delhivery to add this warehouse.`;
      } else if (errorMessage.includes('suspicious order')) {
        errorMessage = 'Order flagged as suspicious. This is common with test data. Real orders should work fine.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Track shipment
  async trackShipment(waybill) {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/v1/packages/json/`,
        {
          params: {
            token: this.apiKey,
            waybill: waybill
          }
        }
      );

      if (response.data && response.data.ShipmentData?.[0]) {
        const shipment = response.data.ShipmentData[0].Shipment;
        return {
          success: true,
          status: shipment.Status.Status,
          location: shipment.Origin,
          destination: shipment.Destination,
          delivered_date: shipment.PickUpDate,
          scans: shipment.Scans || []
        };
      }

      return {
        success: false,
        error: 'No tracking information found'
      };
    } catch (error) {
      console.error('Error tracking shipment:', error.message);
      return {
        success: false,
        error: 'Unable to track shipment'
      };
    }
  }

  // Get pickup locations
  async getPickupLocations() {
    try {
      // Use the working pincode endpoint to get location info instead
      const response = await axios.get(
        `https://track.delhivery.com/c/api/pin-codes/json/`,
        {
          params: {
            token: this.apiKey,
            filter_codes: this.pickupLocation.pincode
          }
        }
      );

      if (response.data && response.data.delivery_codes) {
        return response.data.delivery_codes.map(code => ({
          name: this.pickupLocation.name,
          address: this.pickupLocation.address,
          city: code.postal_code.city,
          state: code.postal_code.state_code,
          pincode: code.postal_code.pin
        }));
      }

      return [{
        name: this.pickupLocation.name,
        address: this.pickupLocation.address,
        city: this.pickupLocation.city,
        state: this.pickupLocation.state,
        pincode: this.pickupLocation.pincode
      }];
    } catch (error) {
      console.error('Error fetching pickup locations:', error.message);
      return [{
        name: this.pickupLocation.name,
        address: this.pickupLocation.address,
        city: this.pickupLocation.city,
        state: this.pickupLocation.state,
        pincode: this.pickupLocation.pincode
      }];
    }
  }

  // Cancel shipment
  async cancelShipment(waybill) {
    try {
      const response = await axios.post(
        `${this.baseURL}/p/edit`,
        {
          waybill: waybill,
          cancellation: true
        },
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data?.success || false,
        message: response.data?.message || 'Cancellation request processed'
      };
    } catch (error) {
      console.error('Error cancelling shipment:', error.message);
      return {
        success: false,
        error: 'Unable to cancel shipment'
      };
    }
  }
}

module.exports = new DelhiveryService();