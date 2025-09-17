const delhiveryService = require('../../services/delhiveryService');

// Check pincode serviceability
const checkPincodeServiceability = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 6-digit pincode'
      });
    }

    const serviceabilityData = await delhiveryService.checkPincodeServiceability(pincode);
    
    res.status(200).json({
      success: true,
      data: serviceabilityData
    });
  } catch (error) {
    console.error('Error checking pincode serviceability:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to check pincode serviceability'
    });
  }
};

// Calculate shipping rates
const calculateShippingRates = async (req, res) => {
  try {
    const { toPincode, weight = 0.5, cod = false } = req.body;
    const fromPincode = process.env.PICKUP_PINCODE || '400001';

    if (!toPincode || toPincode.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid destination pincode'
      });
    }

    const shippingRates = await delhiveryService.calculateShippingRate(
      fromPincode,
      toPincode,
      weight,
      cod
    );
    
    res.status(200).json({
      success: true,
      data: shippingRates
    });
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to calculate shipping rates'
    });
  }
};

// Track shipment
const trackShipment = async (req, res) => {
  try {
    const { waybill } = req.params;

    if (!waybill) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a waybill number'
      });
    }

    const trackingData = await delhiveryService.trackShipment(waybill);
    
    res.status(200).json({
      success: true,
      data: trackingData
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to track shipment'
    });
  }
};

// Get pickup locations
const getPickupLocations = async (req, res) => {
  try {
    const pickupLocations = await delhiveryService.getPickupLocations();
    
    res.status(200).json({
      success: true,
      data: pickupLocations
    });
  } catch (error) {
    console.error('Error fetching pickup locations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to fetch pickup locations'
    });
  }
};

// Cancel shipment
const cancelShipment = async (req, res) => {
  try {
    const { waybill } = req.params;

    if (!waybill) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a waybill number'
      });
    }

    const cancelResult = await delhiveryService.cancelShipment(waybill);
    
    res.status(200).json({
      success: cancelResult.success,
      data: cancelResult
    });
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to cancel shipment'
    });
  }
};

module.exports = {
  checkPincodeServiceability,
  calculateShippingRates,
  trackShipment,
  getPickupLocations,
  cancelShipment
};