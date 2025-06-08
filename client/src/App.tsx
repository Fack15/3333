import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/layout/Navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CreateProductPage from "@/pages/CreateProductPage";
import IngredientsPage from "@/pages/IngredientsPage";
import CreateIngredientPage from "@/pages/CreateIngredientPage";
import EditIngredientPage from "@/pages/EditIngredientPage";
import EditProductPage from "@/pages/EditProductPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/products">
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/products/create">
        <ProtectedRoute>
          <CreateProductPage />
        </ProtectedRoute>
      </Route>
      <Route path="/products/edit/:id">
        <ProtectedRoute>
          <EditProductPage />
        </ProtectedRoute>
      </Route>
      <Route path="/products/:id">
        <ProtectedRoute>
          <ProductDetailPage />
        </ProtectedRoute>
      </Route>
      <Route path="/ingredients">
        <ProtectedRoute>
          <IngredientsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/ingredients/create">
        <ProtectedRoute>
          <CreateIngredientPage />
        </ProtectedRoute>
      </Route>
      <Route path="/ingredients/:id/edit">
        <ProtectedRoute>
          <EditIngredientPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
