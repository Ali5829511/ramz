/*
 * رمز الإبداع - منصة إدارة الأملاك
 * App.tsx - التوجيه الرئيسي
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Contracts from "./pages/Contracts";
import Payments from "./pages/Payments";
import Maintenance from "./pages/Maintenance";
import FinancialReports from "./pages/FinancialReports";
import Settings from "./pages/Settings";
import Expenses from "./pages/Expenses";
import Invoices from "./pages/Invoices";
import Owners from "./pages/Owners";
import LeaseAlerts from "./pages/LeaseAlerts";
import OverdueTracker from "./pages/OverdueTracker";
import Complaints from "./pages/Complaints";
import Documents from "./pages/Documents";
import UnitStatus from "./pages/UnitStatus";
import GenericPage from "./pages/GenericPage";
import Analytics from "./pages/Analytics";
import ManagerDashboard from "./pages/ManagerDashboard";
import OwnerPortal from "./pages/OwnerPortal";
import TenantPortal from "./pages/TenantPortal";
import TechnicianManager from "./pages/TechnicianManager";
import Inventory from "./pages/Inventory";
import Alerts from "./pages/Alerts";
import Communication from "./pages/Communication";
import FinancialStatements from "./pages/FinancialStatements";
import DataImport from "./pages/DataImport";
import ArchivePage from "./pages/ArchivePage";
import MaintenanceManager from "./pages/MaintenanceManager";
import FacilitiesPage from "./pages/FacilitiesPage";
import MetersPage from "./pages/MetersPage";
import InsurancePage from "./pages/InsurancePage";
import FinancialForecastPage from "./pages/FinancialForecastPage";
import DatabaseSetupPage from "./pages/DatabaseSetupPage";
import TemplatesPage from "./pages/TemplatesPage";
import MessageTemplatesPage from "./pages/MessageTemplatesPage";
import AlertsCenter from "./pages/AlertsCenter";
import PropertyReportPrint from "./pages/PropertyReportPrint";
import IntegrationsPage from "./pages/IntegrationsPage";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyForm from "./pages/PropertyForm";
import Units from "./pages/Units";
import SmartInsights from "./pages/SmartInsights";
import TenantAnalyticsDashboard from "./pages/TenantAnalyticsDashboard";
import PaymentTimeline from "./pages/PaymentTimeline";
import AutoInvoicing from "./pages/AutoInvoicing";
import AdvancedReports from "./pages/AdvancedReports";
import PropertyComparison from "./pages/PropertyComparison";
import PropertyDocuments from "./pages/PropertyDocuments";
import MapViewPage from "./pages/MapViewPage";
import BrokerageContractsPage from "./pages/BrokerageContractsPage";
import AdLicensesPage from "./pages/AdLicensesPage";
import LeaseContractBuilder from "./pages/LeaseContractBuilder";
import ESignatureManager from "./pages/ESignatureManager";
import TenantRating from "./pages/TenantRating";
import AccountingPage from "./pages/AccountingPage";
import PaymentGateway from "./pages/PaymentGateway";
import PreventiveMaintenanceSystem from "./pages/PreventiveMaintenanceSystem";
import AppointmentsPage from "./pages/AppointmentsPage";
import TicketsPage from "./pages/TicketsPage";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import FinancialSummaryPage from "./pages/FinancialSummaryPage";
import ROIReportsPage from "./pages/ROIReportsPage";
import PropertyStats from "./pages/PropertyStats";
import PropertySingleReport from "./pages/PropertySingleReport";
import MarketResearchPage from "./pages/MarketResearchPage";
import PrintCenterPage from "./pages/PrintCenterPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import SystemGuidePage from "./pages/SystemGuidePage";

// Icons for generic pages
import {
  BarChart2, Building2, Users, DollarSign, Wrench, FileText,
  MessageSquare, Map, Briefcase, ClipboardList, Zap,
  TrendingUp, HelpCircle, Printer, Globe, Calendar, Star, Send
} from 'lucide-react';

function Router() {
  return (
    <Switch>
      {/* الرئيسية */}
      <Route path="/" component={Dashboard} />
      <Route path="/manager-dashboard" component={ManagerDashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/smart-insights" component={SmartInsights} />

      {/* العقارات */}
      <Route path="/properties" component={Properties} />
      <Route path="/property-form" component={PropertyForm} />
      <Route path="/property-detail" component={PropertyDetail} />
      <Route path="/unit-status" component={UnitStatus} />
      <Route path="/units" component={Units} />
      <Route path="/property-comparison" component={PropertyComparison} />
      <Route path="/property-documents" component={PropertyDocuments} />
      <Route path="/map-view" component={MapViewPage} />
      <Route path="/owners" component={Owners} />
      <Route path="/owner-portal" component={OwnerPortal} />
      <Route path="/brokerage-contracts" component={BrokerageContractsPage} />
      <Route path="/ad-licenses" component={AdLicensesPage} />

      {/* المستأجرون */}
      <Route path="/tenants" component={Tenants} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/lease-builder" component={LeaseContractBuilder} />
      <Route path="/e-signature" component={ESignatureManager} />
      <Route path="/lease-alerts" component={LeaseAlerts} />
      <Route path="/tenant-portal" component={TenantPortal} />
      <Route path="/tenant-analytics" component={TenantAnalyticsDashboard} />
      <Route path="/tenant-rating" component={TenantRating} />

      {/* المالية */}
      <Route path="/payments" component={Payments} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/auto-invoicing" component={AutoInvoicing} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/overdue-tracker" component={OverdueTracker} />
      <Route path="/financial-statements" component={FinancialStatements} />
      <Route path="/payment-timeline" component={PaymentTimeline} />
      <Route path="/accounting" component={AccountingPage} />
      <Route path="/payment-gateway" component={PaymentGateway} />

      {/* الصيانة */}
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/maintenance-manager" component={MaintenanceManager} />
      <Route path="/preventive-maintenance" component={PreventiveMaintenanceSystem} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/tickets" component={TicketsPage} />
      <Route path="/technician-dashboard" component={TechnicianDashboard} />
      <Route path="/technician-manager" component={TechnicianManager} />
      <Route path="/inventory" component={Inventory} />

      {/* التقارير */}
      <Route path="/advanced-reports" component={AdvancedReports} />
      <Route path="/financial-reports" component={FinancialReports} />
      <Route path="/financial-summary" component={FinancialSummaryPage} />
      <Route path="/financial-forecasting" component={FinancialForecastPage} />
      <Route path="/financial-forecast" component={FinancialForecastPage} />
      <Route path="/roi-reports" component={ROIReportsPage} />
      <Route path="/property-performance" component={PropertyStats} />
      <Route path="/property-single-report" component={PropertySingleReport} />
      <Route path="/property-report" component={PropertyReportPrint} />
      <Route path="/market-research" component={MarketResearchPage} />
      <Route path="/print-center" component={PrintCenterPage} />

      {/* العمليات */}
      <Route path="/complaints" component={Complaints} />
      <Route path="/documents" component={Documents} />
      <Route path="/communication" component={Communication} />
      <Route path="/whatsapp" component={WhatsAppPage} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/archive" component={ArchivePage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/message-templates" component={MessageTemplatesPage} />
      <Route path="/auto-notifications" component={AlertsCenter} />

      {/* التكاملات */}
      <Route path="/integrations" component={IntegrationsPage} />

      {/* الإعدادات */}
      <Route path="/settings" component={Settings} />
      <Route path="/data-import" component={DataImport} />
      <Route path="/database-setup" component={DatabaseSetupPage} />
      <Route path="/system-guide" component={SystemGuidePage} />

      {/* المرافق والتأمين */}
      <Route path="/facilities" component={FacilitiesPage} />
      <Route path="/meters" component={MetersPage} />
      <Route path="/insurance" component={InsurancePage} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
