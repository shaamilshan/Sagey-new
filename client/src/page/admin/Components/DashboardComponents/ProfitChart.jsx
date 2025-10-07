import React, { useEffect, useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { lineChartNoDecoration } from "@common/configurations";
import axios from "axios";
import { URL } from "@common/api";
import { config } from "@common/configurations";

const ProfitChart = ({ numberOfDates, mode = 'profit' }) => {
  // mode: 'profit' -> sum of product markups (existing), 'revenue' -> sum of order totalPrice
  const [aggregateTotal, setAggregateTotal] = useState(0);
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Decide endpoint & field mapping based on mode
        const endpoint = mode === 'revenue' ? 'revenue-report' : 'profit-report';
        const { data } = await axios.get(
          `${URL}/admin/${endpoint}${
            numberOfDates ? `?numberOfDates=${numberOfDates}` : ''
          }`,
          config
        );

        if (!data) return;

        if (mode === 'revenue') {
          // revenue-report structure: { salesSum: { totalSales }, eachDayData: [{ _id, totalSum }] }
          const total = data.salesSum?.totalSales || 0;
          setAggregateTotal(total);

            const days = numberOfDates || 7;
            const today = new Date();
            const start = new Date();
            start.setDate(start.getDate() - days + 1);
            const revenueMap = new Map(
              (data.eachDayData || []).map(d => [d._id, d.totalSum])
            );
            const fullLabels = [];
            const fullData = [];
            for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
              const key = d.toISOString().slice(0,10);
              fullLabels.push(key);
              fullData.push(revenueMap.get(key) || 0);
            }
            setLabels(fullLabels);
            setData(fullData);
        } else {
          // profit mode (existing logic)
          const total = data.totalProfit?.totalMarkupSum || 0;
          setAggregateTotal(total);
          const days = numberOfDates || 7;
          const today = new Date();
          const start = new Date();
          start.setDate(start.getDate() - days + 1);
          const profitMap = new Map(
            (data.profitByDay || []).map(d => [d._id, d.dailyMarkupSum])
          );
          const fullLabels = [];
          const fullData = [];
          for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().slice(0,10);
            fullLabels.push(key);
            fullData.push(profitMap.get(key) || 0);
          }
          setLabels(fullLabels);
          setData(fullData);
        }
      } catch (e) {
        console.error('ProfitChart load error', e);
        setAggregateTotal(0);
        setLabels([]);
        setData([]);
      }
    };
    loadData();
  }, [numberOfDates, mode]);

  // TEMPORARILY DISABLED (will restore later)
  // Completely hide component from UI
  return null;

  // Previous placeholder (kept for future reference)
  // return (
  //   <div className="bg-white p-5 rounded-md w-full">
  //     <p className="text-sm text-gray-500 italic">Profit / Revenue chart temporarily disabled.</p>
  //   </div>
  // );

  // Original chart rendering kept below for restoration
  // return (
  //   <div className="bg-white p-5 rounded-md w-full flex justify-between">
  //     <div>
  //       <h3 className="font-semibold text-gray-700 text-sm">{mode === 'revenue' ? 'Revenue' : 'Profit'}</h3>
  //       <h1 className="text-2xl font-semibold">₹{Number(aggregateTotal).toFixed(2)}</h1>
  //       <p className="font-semibold text-sm text-gray-500">
  //         {mode === 'revenue' ? 'Total order value' : 'Profit for selected period'}
  //       </p>
  //     </div>
  //     <div className="w-36">
  //       <Line
  //         data={{
  //           labels: labels,
  //           datasets: [
  //             {
  //               label: mode === 'revenue' ? 'Revenue' : 'Profit',
  //               data: data,
  //               backgroundColor: mode === 'revenue' ? '#2563eb' : '#38d64d',
  //               borderColor: mode === 'revenue' ? '#2563eb' : '#38d64d',
  //               borderWidth: 3,
  //             },
  //           ],
  //         }}
  //         options={lineChartNoDecoration}
  //       />
  //     </div>
  //   </div>
  // );
};

export default ProfitChart;
