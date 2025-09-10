import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import { ChevronDown, Heart, Menu, ShoppingCart, User, X } from "lucide-react";
import "animate.css"; // Import Animate.css for animations
import SageLogo from "../assets/sage-logo.png";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import CarouselTextSlider from "./CarouselTextSlider";

const Navbar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [sort, setSort] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const categories = [
    {
      title: "TOP",
      subcategories: ["length tops", "Long tops (Maxi gowns)"],
    },
    {
      title: "ETHNIC WEARS",
      subcategories: ["Cotton wears", "Partywears", "Regular wears"],
    },
    {
      title: "HIJAB",
      subcategories: [],
    },
    {
      title: "CORD SETS",
      subcategories: [],
    },
  ];

  const handleNavigation = (category) => {
    const formattedCategory = category.toLowerCase().replace(/\s+/g, "-");
    navigate(`/collections?search=${formattedCategory}`);
  };

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const priceParam = searchParams.get("price");
    const searchParam = searchParams.get("search");
    const sortParam = searchParams.get("sort");
    const page = searchParams.get("page");

    setCategory(categoryParam ? categoryParam.split(",") : []);
    setPrice(priceParam || "");
    setSort(sortParam || "");
    setPage(page || 1);
    setSearch(searchParam || "");
  }, []);

  const handleClick = (param, value) => {
    const params = new URLSearchParams(window.location.search);

    if (value === "" || (param === "page" && value === 1)) {
      params.delete(param);
      if (param === "price") {
        setPrice("");
      }
      if (param === "sort") {
        setSort("");
        params.delete("page");
        setPage(1);
      }
    } else {
      if (param === "category" && value) {
        let cat = params.get("category");
        if (!cat) {
          params.append("category", value);
          setCategory([value]);
        } else {
          let temp = cat.split(",");
          if (temp.length > 0) {
            if (temp.includes(value)) {
              temp = temp.filter((item) => item !== value);
            } else {
              temp.push(value);
            }

            if (temp.length > 0) {
              params.set("category", temp.join(","));
              setCategory(temp);
            } else {
              params.delete("category");
              setCategory([]);
            }
          } else {
            params.delete("category");
            setCategory([]);
          }
        }
      } else {
        params.set(param, value);
        if (param === "price") {
          setPrice(value);
          params.delete("page");
          setPage(1);
        }
        if (param === "sort") {
          setSort(value);
          params.delete("page");
          setPage(1);
        }
        if (param === "search") {
          params.delete("page");
          setPage(1);
        }
      }
    }

    setSearchParams(params.toString() ? "?" + params.toString() : "");
  };

  const [showSideNavbar, setShowSideNavbar] = useState(false);

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 flex-1 pr-3">
            <a href="/" className="flex-shrink-0">
              <img src={SageLogo} alt="Logo" className="h-auto w-[80px] md:w-[120px]" />
            </a>
            
            <nav className="hidden lg:flex flex-1 justify-center gap-12 text-xl font-semibold text-gray-700 pr-5">
              <button onClick={() => handleNavigation("TOPS")} className="hover:text-primary transition">
                TOPS
              </button>
              <button onClick={() => handleNavigation("GAWON")} className="hover:text-primary transition">
                GAWON
              </button>
              <button onClick={() => handleNavigation("ROMPER")} className="hover:text-primary transition">
                ROMPER
              </button>
              <button onClick={() => handleNavigation("KNEE LENGTH")} className="hover:text-primary transition">
                KNEE LENGTH
              </button>
            </nav>

            <div className="relative w-40 ml-auto hidden lg:block">
              <SearchBar
                handleClick={handleClick}
                search={search}
                setSearch={setSearch}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-10 md:gap-10 pr-25 ml-12">
            <Link to="/dashboard/wishlist" variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/cart" variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link to="/dashboard/profile" variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Link>
            <Menu
              className="h-5 w-5 hidden max-lg:block cursor-pointer"
              onClick={() => setShowSideNavbar(true)}
            />
          </div>
        </div>

        {/* --- SIDEBAR SECTION MODIFIED --- */}
        {showSideNavbar && (
          <div
            className={`fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-1/3 h-screen bg-primary z-50 animate__animated ${
              showSideNavbar ? "animate__fadeInRight" : "animate__fadeOutRight"
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <X
                className="h-6 w-6 text-white cursor-pointer"
                onClick={() => setShowSideNavbar(false)}
              />
              <div className="relative w-40">
                <SearchBar
                  handleClick={handleClick}
                  search={search}
                  setSearch={setSearch}
                />
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4">
              <ul className="flex flex-col gap-5 mt-4">
                <li>
                  <button
                    onClick={() => {
                      handleNavigation("TOPS & TEES");
                      setShowSideNavbar(false);
                    }}
                    className="text-white text-sm font-medium hover:text-gray-300"
                  >
                    TOPS & TEES
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleNavigation("DRESSES");
                      setShowSideNavbar(false);
                    }}
                    className="text-white text-sm font-medium hover:text-gray-300"
                  >
                    DRESSES
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleNavigation("BOTTOMS");
                      setShowSideNavbar(false);
                    }}
                    className="text-white text-sm font-medium hover:text-gray-300"
                  >
                    BOTTOMS
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleNavigation("ETHNIC WEAR");
                      setShowSideNavbar(false);
                    }}
                    className="text-white text-sm font-medium hover:text-gray-300"
                  >
                    ETHNIC WEAR
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      {window.location.pathname === "/" && (
        <div className="w-full flex justify-center items-center relative">
          <nav className=" hidden  py-3  w-full bg-primary">
            <ul className="flex gap-8 px-4 justify-center items-center">
            {categories.map((category, index) => (
                <li
                  key={category.title}
                  className="relative text-sm font-medium text-white hover:text-gray-300 cursor-pointer"
                  onMouseEnter={() => setActiveDropdown(index)}
                >
                  <span onClick={() => handleNavigation(category.title)}>
                    {category.title}
                  </span>
                  {category.subcategories.length > 0 && (
                    <div
                      className={cn(
                        "absolute min-w-max bg-white text-gray-900 rounded-md mt-2 shadow-lg z-50",
                        activeDropdown === index ? "block" : "hidden"
                      )}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="py-2 ">
                        {category.subcategories.map((sub, subIndex) => (
                          <button
                            key={`${index}-${subIndex}`}
                            onClick={() => handleNavigation(sub)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;