import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import uiReducer from "@/redux/slices/uiSlice";
import companyReducer from "@/redux/slices/companySlice";
import showroomReducer from "@/redux/slices/showroomSlice";
import employeeReducer from "@/redux/slices/employeeSlice";
import permissionReducer from "@/redux/slices/permissionSlice";
import toastReducer from "@/redux/slices/toastSlice";
import sessionReducer from "@/redux/slices/sessionSlice";
import dashboardReducer from "@/redux/slices/dashboardSlice";
import notificationReducer from "@/redux/slices/notificationSlice";
import tableLayoutReducer from "@/redux/slices/tableLayoutSlice";
import categoryReducer from "@/redux/slices/categorySlice";
import productGroupReducer from "@/redux/slices/productGroupSlice";
import productNameReducer from "@/redux/slices/productNameSlice";
import productModelReducer from "@/redux/slices/productModelSlice";
import supplierReducer from "@/redux/slices/supplierSlice"
import purchaseReducer from "@/redux/slices/purchaseSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    company: companyReducer,
    showroom: showroomReducer,
    employee: employeeReducer,
    permission: permissionReducer,
    toast: toastReducer,
    session: sessionReducer,
    dashboard: dashboardReducer,
    notification: notificationReducer,
    tableLayout: tableLayoutReducer,
    category: categoryReducer,
    productGroup: productGroupReducer,
    productName: productNameReducer,
    productModel: productModelReducer,
    supplier: supplierReducer,
    purchase: purchaseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
