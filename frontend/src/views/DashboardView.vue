<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  scales,
  plugins,
  ArcElement,
  type TooltipItem,
} from "chart.js";
import { Line, Pie } from "vue-chartjs";
import { useOrderStore } from "@/stores/order";
import { useRoute } from "vue-router";
// import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const orderStore = useOrderStore();
const route = useRoute();
const shopId = route.params.id as string;
let product_qty_pie: number[] = [];
let product_qty_back: number[] = [];

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: "Sales",
      backgroundColor: "#007bff",
      tension: 0.3,
      data: [] as number[],
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 20,
      },
    },
  },
});

const chartData_pie = ref({
  labels: [] as string[],
  datasets: [
    {
      backgroundColor: [] as string[],
      data: [] as number[],
    },
  ],
});

const chartOptions_pie = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"pie">) => {
          const currentVal = context.raw as number;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0,
          );
          const percentage = ((currentVal / total) * 100).toFixed(1);
          return `${context.label}: ${currentVal}฿ (${percentage}%)`;
        },
      },
    },
  },
} as const);

const chartData_back = ref({
  labels: [] as string[],
  datasets: [
    {
      backgroundColor: [] as string[],
      data: [] as number[],
    },
  ],
});

const chartOptions_back = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"pie">) => {
          const currentVal = context.raw as number;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0,
          );
          const percentage = ((currentVal / total) * 100).toFixed(1);
          return `${context.label}: ${currentVal}฿ (${percentage}%)`;
        },
      },
    },
  },
} as const);

type Board = "summary" | "product" | "bounce back";
type DateButton = "today" | "7 days" | "1 month";
const stages: Board[] = ["summary", "product", "bounce back"];
const buttons: DateButton[] = ["today", "7 days", "1 month"];
const currentStage = ref<Board>("summary");
const currentDateFilter = ref<DateButton>("today");

const totalSales = ref(0);
const orderAmount = ref(0);
const avgOrderValue = ref(0);
const filteredSales = ref(0);
const filteredMostSale = ref(0);
const filteredOrders = ref(0);
const totalBack = ref(0);
const orderBack = ref(0);

const selectStage = (stage: Board): void => {
  currentStage.value = stage;
};

const selectDateFilter = (stage: DateButton): void => {
  currentDateFilter.value = stage;
};

const calculateStats = () => {
  // Reset all-time stats
  totalSales.value = 0;
  orderAmount.value = 0;

  // Reset filtered stats
  filteredSales.value = 0;
  filteredOrders.value = 0;
  filteredMostSale.value = 0;
  orderBack.value = 0;
  totalBack.value = 0;

  const now = new Date();
  const filter = currentDateFilter.value;

  let labels: string[] = [];
  let labels_pie: string[] = [];
  let labels_back: string[] = [];
  let dataPoints: number[] = [];
  let dataPoints_pie: number[] = [];
  let backgroundColor_pie: string[] = [];
  let dataPoints_back: number[] = [];
  let backgroundColor_back: string[] = [];

  product_qty_pie = [];
  product_qty_back = [];

  // Setup Chart Labels
  if (filter === "today") {
    labels = [
      "00.00 - 05.59",
      "06.00 - 11.59",
      "12.00 - 17.59",
      "18.00 - 23.59",
    ];
    dataPoints = [0, 0, 0, 0];
  } else if (filter === "7 days") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      labels.push(
        d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      );
      dataPoints.push(0);
    }
  } else if (filter === "1 month") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      labels.push(
        d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      );
      dataPoints.push(0);
    }
  }

  // Determine cutoff date for ranges
  const cutoffDate = new Date();
  cutoffDate.setHours(0, 0, 0, 0);
  if (filter === "7 days") {
    cutoffDate.setDate(cutoffDate.getDate() - 6);
  } else if (filter === "1 month") {
    cutoffDate.setDate(cutoffDate.getDate() - 29);
  }

  // Iterate over orders
  for (const order of orderStore.orders) {
    if (order.status === "cancel" || order.status === "draft") continue;

    orderAmount.value += 1;
    const orderDateObj = new Date(order.orderDate);

    // Check if order falls in filter range
    let inRange = false;
    if (filter === "today") {
      inRange = orderDateObj.toDateString() === now.toDateString();
    } else {
      inRange = orderDateObj >= cutoffDate && orderDateObj <= now;
    }

    if (inRange) {
      filteredOrders.value += 1;
      if (order.status === "bounce back") {
        orderBack.value += 1;
      }
    }

    for (const item of order.orderItem) {
      totalSales.value += item.totalPrice;

      if (inRange) {
        filteredSales.value += item.totalPrice;
        if (order.totalPrice > filteredMostSale.value) {
          filteredMostSale.value = order.totalPrice;
        }

        // Add to chart
        if (filter === "today") {
          const h = orderDateObj.getHours();
          if (h < 6) dataPoints[0] += item.totalPrice;
          else if (h < 12) dataPoints[1] += item.totalPrice;
          else if (h < 18) dataPoints[2] += item.totalPrice;
          else dataPoints[3] += item.totalPrice;
        } else {
          // For 7 days and 1 month, match the order's date to the label
          const dateStr = orderDateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          });
          const idx = labels.indexOf(dateStr);
          if (idx !== -1) {
            dataPoints[idx] += item.totalPrice;
          }
        } // product algo
        if (!labels_pie.includes(item.name)) {
          labels_pie.push(item.name);
          dataPoints_pie.push(item.totalPrice);
          product_qty_pie.push(item.quantity);
          backgroundColor_pie.push(
            "#" +
              Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, "0"),
          );
        } else {
          dataPoints_pie[labels_pie.indexOf(item.name)] += item.totalPrice;
          product_qty_pie[labels_pie.indexOf(item.name)] += item.quantity;
        }

        // bounce back algo
        if (order.status === "bounce back") {
          totalBack.value += item.totalPrice;
          if (!labels_back.includes(item.name)) {
            labels_back.push(item.name);
            dataPoints_back.push(item.totalPrice);
            product_qty_back.push(item.quantity);
            backgroundColor_back.push(
              "#" +
                Math.floor(Math.random() * 16777215)
                  .toString(16)
                  .padStart(6, "0"),
            );
          } else {
            dataPoints_back[labels_back.indexOf(item.name)] += item.totalPrice;
            product_qty_back[labels_back.indexOf(item.name)] += item.quantity;
          }
        }
      }
    }
  }

  avgOrderValue.value =
    orderAmount.value > 0 ? totalSales.value / orderAmount.value : 0;
  avgOrderValue.value = Math.floor(avgOrderValue.value);
  // Reactively replace chart data
  chartData.value = {
    labels,
    datasets: [
      {
        label: `${filter.charAt(0).toUpperCase() + filter.slice(1)} Sales`,
        backgroundColor: "#007bff",
        tension: 0.3,
        data: dataPoints,
      },
    ],
  };

  chartData_pie.value = {
    labels: labels_pie,
    datasets: [
      {
        backgroundColor: backgroundColor_pie,
        data: dataPoints_pie,
      },
    ],
  };

  chartData_back.value = {
    labels: labels_back,
    datasets: [
      {
        backgroundColor: backgroundColor_back,
        data: dataPoints_back,
      },
    ],
  };
};

const productSales = computed(() => {
  const names = chartData_pie.value.labels || [];
  const prices = chartData_pie.value.datasets[0]?.data || [];
  const quantities = product_qty_pie || [];

  return names.map((name, index) => ({
    no: index + 1,
    name: name,
    price: prices[index],
    qty: quantities[index],
  }));
});

const bounceBack = computed(() => {
  const names = chartData_back.value.labels || [];
  const quantities = product_qty_back || [];

  return names.map((name, index) => ({
    no: index + 1,
    name: name,
    qty: quantities[index],
  }));
});

// Re-calculate when the user clicks a different filter tab
watch(
  () => currentDateFilter.value,
  () => {
    calculateStats();
  },
);

onMounted(async () => {
  await orderStore.fetchOrdersByShop(shopId);
  calculateStats();
});
</script>
<template>
  <div class="page-container">
    <div class="header-actions">
      <h2>Dashboard</h2>
    </div>
    <div class="board-tabs">
      <span
        v-for="status in stages"
        :key="status"
        @click="selectStage(status)"
        :class="{ active: currentStage === status }"
        class="tab"
      >
        {{ status }}
      </span>
    </div>
    <div class="board-tabs2">
      <button
        v-for="status in buttons"
        :key="status"
        @click="selectDateFilter(status)"
        :class="{ active: currentDateFilter === status }"
        class="btn-tab"
      >
        {{ status }}
      </button>
    </div>
    <!-- header info : summary -->
    <div v-if="currentStage == 'summary'" class="board-tabs2">
      <div class="total-sales">
        <div>total sales</div>
        <strong> {{ totalSales }}฿ </strong>
      </div>
      <div class="total-sales">
        <div>total order</div>
        <strong> {{ orderAmount }} </strong>
      </div>
      <div class="total-sales">
        <div>average value per order</div>
        <strong> {{ avgOrderValue }}฿ </strong>
      </div>
    </div>
    <!-- header info: bounce back -->
    <div v-if="currentStage == 'bounce back'" class="board-tabs2">
      <div class="total-sales">
        <div>bounce back values</div>
        <strong> {{ totalBack }}฿ </strong>
      </div>
      <div class="total-sales">
        <div>bounce back order(s)</div>
        <strong> {{ orderBack }} </strong>
      </div>
    </div>

    <!-- Charts -->
    
    <div v-if="currentStage == 'summary'">
      <Line
        :data="chartData"
        :options="chartOptions"
        style="position: relative"
      />
    </div>
    <!-- Product section -->
    <div
      v-if="currentStage == 'product' || currentStage == 'bounce back'"
      class="board-tabs2"
    >
      <div style="min-height: 200px; display: flex; align-items: center; justify-content: center; position: relative;">
        <!-- Product Pie Chart -->
        <template v-if="currentStage == 'product'">
          <Pie
            v-if="productSales.length > 0"
            :data="chartData_pie"
            :options="chartOptions_pie"
            style="position: relative"
          />
          <div v-else style="color: #888; font-style: italic;">
            No order information
          </div>
        </template>
        
        <!-- Bounce Back Pie Chart -->
        <template v-if="currentStage == 'bounce back'">
          <Pie
            v-if="bounceBack.length > 0"
            :data="chartData_back"
            :options="chartOptions_back"
            style="position: relative"
          />
          <div v-else style="color: #888; font-style: italic;">
            No bounce back information
          </div>
        </template>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>no</th>
            <th>product name</th>
            <th>quantity</th>
            <th v-if="currentStage == 'product'">value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="orderStore.loading">
            <td colspan="6" style="text-align: center">Loading products...</td>
          </tr>
          <tr v-else-if="orderStore.orders.length === 0">
            <td colspan="6" style="text-align: center">No products found.</td>
          </tr>
          <template v-else>
            <template
              v-if="currentStage == 'product'"
              v-for="product in productSales"
              :key="product"
            >
              <!-- Product Row -->
              <tr>
                <td>{{ product.no || "-" }}</td>
                <td>{{ product.name || "-" }}</td>
                <td>{{ product.qty || "-" }}</td>
                <td>{{ product.price || "-" }}฿</td>
              </tr>
            </template>
            <template
              v-if="currentStage == 'bounce back'"
              v-for="product in bounceBack"
              :key="product"
            >
              <!-- Product Row -->
              <tr>
                <td>{{ product.no || "-" }}</td>
                <td>{{ product.name || "-" }}</td>
                <td>{{ product.qty || "-" }}</td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="currentStage == 'summary'" class="board-tabs2">
      <div class="total-sales">
        <div>{{ currentDateFilter }} sales</div>
        <strong> {{ filteredSales }} </strong>
      </div>
      <div class="total-sales">
        <div>{{ currentDateFilter }} most value</div>
        <strong> {{ filteredMostSale }}฿ </strong>
      </div>
      <div class="total-sales">
        <div>{{ currentDateFilter }} order(s)</div>
        <strong> {{ filteredOrders }} </strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../styles/order.css";
</style>
