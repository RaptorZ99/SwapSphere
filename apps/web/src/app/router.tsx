import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../components/app-layout";
import { DashboardPage } from "../pages/dashboard-page";
import { SelectUserPage } from "../pages/select-user-page";
import { TradeDetailPage } from "../pages/trade-detail-page";
import { TradeNewPage } from "../pages/trade-new-page";
import { TradesInboxPage } from "../pages/trades-inbox-page";
import { UserItemsPage } from "../pages/user-items-page";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/select-user" element={<SelectUserPage />} />
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users/:userId/items" element={<UserItemsPage />} />
        <Route path="trades/new/:userId" element={<TradeNewPage />} />
        <Route path="trades/:tradeId" element={<TradeDetailPage />} />
        <Route path="trades/inbox" element={<TradesInboxPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/select-user" replace />} />
    </Routes>
  );
};
