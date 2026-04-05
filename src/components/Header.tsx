import { ShoppingCart, User, Search, ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo/logo.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const Header = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeSection, setActiveSection] = useState("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { items } = useCart();
    const { isAdmin, isLoading } = useAuth();
    const navigate = useNavigate();
    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Close mobile menu when clicking on a link
    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white sticky top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-20 py-4">
                {/* Logo and Brand */}
                <div className="flex items-center justify-between mb-4">
                    <Link
                        to="/"
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                        onClick={handleNavClick}
                    >
                        <img src={logo} alt="MY Shoes Logo" className="h-8 sm:h-10 w-auto" />
                        <h1 className="text-xl sm:text-2xl font-bold">MY Shoes</h1>
                    </Link>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 sm:h-10 sm:w-10"
                            onClick={() => {
                                navigate("/cart");
                                handleNavClick();
                            }}
                        >
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                            {cartItemCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-accent text-xs">
                                    {cartItemCount}
                                </Badge>
                            )}
                        </Button>

                        {/* Only show admin button if already logged in as admin */}
                        {isAdmin && (
    <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 sm:h-10 sm:w-10"
        onClick={() => {
            navigate(isAdmin ? "/admin/dashboard" : "/admin");
            handleNavClick();
        }}
    >
        <User className="h-4 w-4 sm:h-5 sm:w-5" />
    </Button>
)}

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`w-4 h-0.5 bg-current transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                                <span className={`w-4 h-0.5 bg-current transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                <span className={`w-4 h-0.5 bg-current transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={`bg-gray-100 rounded-lg sm:rounded-full px-4 sm:px-6 py-3 ${isMenuOpen ? 'block' : 'hidden sm:block'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8">
                            <Link
                                to="/"
                                className="text-sm sm:text-base font-semibold hover:text-accent transition-colors w-full sm:w-auto py-1 sm:py-0"
                                onClick={handleNavClick}
                            >
                                Home
                            </Link>
                            <Link
                                to="/produits"
                                className="text-sm sm:text-base font-semibold hover:text-accent transition-colors w-full sm:w-auto py-1 sm:py-0"
                                onClick={handleNavClick}
                            >
                                Produits
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="text-sm sm:text-base font-semibold hover:text-accent transition-colors w-full sm:w-auto py-1 sm:py-0"
                                    onClick={handleNavClick}
                                >
                                    Admin
                                </Link>
                            )}
                        </div>

                        <div className="sm:hidden border-t border-gray-300 pt-3 mt-1">
                            <Link
                                to="/cart"
                                className="text-sm font-semibold hover:text-accent transition-colors block py-1"
                                onClick={handleNavClick}
                            >
                                View Cart ({cartItemCount})
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;