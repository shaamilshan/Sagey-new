require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./model/orderModel');

async function monitorOrders() {
  console.log('📊 Monitoring Order Integration Status...\n');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Watch for new orders every 5 seconds
    setInterval(async () => {
      const latestOrder = await Order.findOne({})
        .sort({ createdAt: -1 })
        .select('orderId status createdAt delhivery paymentMode totalPrice')
        .lean();
      
      if (latestOrder) {
        console.log(`\n🔄 Latest Order Status (${new Date().toLocaleTimeString()}):`);
        console.log(`   Order ID: ${latestOrder.orderId}`);
        console.log(`   Status: ${latestOrder.status}`);
        console.log(`   Payment: ${latestOrder.paymentMode}`);
        console.log(`   Total: ₹${latestOrder.totalPrice}`);
        console.log(`   Created: ${new Date(latestOrder.createdAt).toLocaleString()}`);
        
        if (latestOrder.delhivery) {
          console.log(`   🚚 Delhivery Integration:`);
          console.log(`      Waybill: ${latestOrder.delhivery.waybill || 'None'}`);
          console.log(`      Status: ${latestOrder.delhivery.shipmentStatus || 'None'}`);
          console.log(`      Error: ${latestOrder.delhivery.integrationError || 'None'}`);
          console.log(`      Last Attempt: ${latestOrder.delhivery.lastAttempt || 'None'}`);
        } else {
          console.log(`   ❌ No Delhivery integration data`);
        }
      }
    }, 5000);
    
    console.log('✅ Monitoring started. Place an order to see real-time integration status...');
    console.log('Press Ctrl+C to stop monitoring.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

monitorOrders();