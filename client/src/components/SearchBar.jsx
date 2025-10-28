import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BiSearch } from "react-icons/bi";
import { GrClose } from "react-icons/gr";
import { FiX } from "react-icons/fi";
import { getSearchSuggestions } from "../redux/actions/user/searchSuggestionsActions";
import { clearSuggestions, hideSuggestions, showSuggestions } from "../redux/reducers/user/searchSuggestionsSlice";
import { useNavigate } from "react-router-dom";


const SearchBar = ({ handleClick, search, setSearch, placeholder, label, liveFilter = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suggestions, isVisible, loading } = useSelector((state) => state.searchSuggestions);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionRefs = useRef([]);
  const debounceTimer = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        dispatch(getSearchSuggestions(query.trim()));
      } else {
        dispatch(clearSuggestions());
      }
    }, 300);
  }, [dispatch]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (liveFilter) {
      handleClick("search", value);
    }
    setActiveIndex(-1);
    debouncedSearch(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion.name);
    dispatch(hideSuggestions());
    if (liveFilter) {
      // Use live filter on the same page
      handleClick("search", suggestion.name);
    } else {
      // Navigate to collections without creating extra history entries
      navigate(`/collections?search=${encodeURIComponent(suggestion.name)}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isVisible || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSuggestionClick(suggestions[activeIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        dispatch(hideSuggestions());
        setActiveIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        dispatch(hideSuggestions());
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(hideSuggestions());
    if (liveFilter) {
      handleClick("search", search);
    } else {
      navigate(`/collections?search=${encodeURIComponent(search)}`);
    }
  };

  // Clear search
  const clearSearch = () => {
    handleClick("search", "");
    setSearch("");
    dispatch(clearSuggestions());
    setActiveIndex(-1);
  };

  return (
    <div className="w-full flex items-center space-x-4 max-w-xl" ref={searchRef}>
      {/* Text near the search bar */}
      {label && <span className="text-cyan-600 text-lg">{label}</span>}

      {/* Search bar container */}
      <div className="relative flex-grow">
        <form
          className="flex items-center bg-white py-1 px-4 rounded-full border border-cyan-600"
          onSubmit={handleSubmit}
        >
          <BiSearch className="text-2xl text-cyan-600 hover:text-cyan-800" />
          <input
            type="text"
            className="outline-none w-full bg-white rounded px-2 py-0.5 placeholder-cyan-600 text-cyan-600"
            placeholder={placeholder || "Search"}
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                dispatch(showSuggestions());
              }
            }}
          />
          {search ? (
            <button
              type="button"
              className="ml-2"
              onClick={clearSearch}
            >
              <FiX className="text-xl text-cyan-600 hover:text-cyan-800 transition-colors duration-200" />
            </button>
          ) : null}

          {/* Submit button */}
          <button
            type="submit"
            className="ml-2 text-cyan-600 hover:text-cyan-800 transition-colors"
          >
          </button>
        </form>

        {/* Suggestions dropdown */}
        {isVisible && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion._id}
                ref={(el) => (suggestionRefs.current[index] = el)}
                className={`px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                  index === activeIndex
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="flex items-center">
                  <BiSearch className="text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {suggestion.name}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="px-4 py-3 text-center text-gray-500 text-sm">
                Searching...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
