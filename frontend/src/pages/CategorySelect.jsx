import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import BottomNav from '../components/BottomNav.jsx';

// Categories are different for each tested level. Each one now also carries:
//  - image: a real photo so the card isn't just an emoji + text
//  - topics: the specific things practiced inside this category (vocabulary,
//    speaking, grammar, etc.) so it's clear what "learning" actually means
//    before clicking in.
const CATEGORIES_BY_LEVEL = {
  basic: [
    {
      key: "greetings",
      title: "Greetings & Introductions",
      icon: "👋",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Everyday phrases"],
    },
    {
      key: "daily-routine",
      title: "Daily Routine",
      icon: "☀️",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Present tense", "Vocabulary"],
    },
    {
      key: "family-friends",
      title: "Family & Friends",
      icon: "👨‍👩‍👧",
      image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
    {
      key: "simple-shopping",
      title: "Simple Shopping",
      icon: "🛒",
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Numbers & prices", "Vocabulary"],
    },
    {
      key: "directions",
      title: "Asking Directions",
      icon: "🧭",
      image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Prepositions", "Vocabulary"],
    },
    {
      key: "weather-time",
      title: "Weather & Time",
      icon: "🌦️",
      image: "https://images.unsplash.com/photo-1601134467661-3d775b999c8b?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Small talk"],
    },
    {
      key: "hobbies",
      title: "Hobbies & Free Time",
      icon: "🎨",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
    {
      key: "health-basic",
      title: "At the Doctor",
      icon: "🩺",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Describing symptoms"],
    },
    {
      key: "numbers-counting",
      title: "Numbers & Counting",
      icon: "🔢",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Numbers & prices", "Vocabulary"],
    },
    {
      key: "clothing-appearance",
      title: "Clothing & Appearance",
      icon: "👕",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
    {
      key: "school-learning",
      title: "School & Learning",
      icon: "📚",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Everyday phrases"],
    },
    {
      key: "emotions-feelings",
      title: "Emotions & Feelings",
      icon: "🙂",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
    { key: "colors-basic", title: "Colors & Shapes", icon: "🎨", image: "https://loremflickr.com/600/400/colors", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "days-months", title: "Days & Months", icon: "📅", image: "https://loremflickr.com/600/400/calendar", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "kitchen-cooking", title: "Kitchen & Cooking", icon: "🍳", image: "https://loremflickr.com/600/400/kitchen", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "home-house", title: "Around the House", icon: "🏡", image: "https://loremflickr.com/600/400/livingroom", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "pets-animals", title: "Pets & Animals", icon: "🐶", image: "https://loremflickr.com/600/400/pets", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "public-transport", title: "Public Transport", icon: "🚌", image: "https://loremflickr.com/600/400/bus", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "at-the-park", title: "At the Park", icon: "🌳", image: "https://loremflickr.com/600/400/park", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "birthday-party", title: "Birthday Party", icon: "🎂", image: "https://loremflickr.com/600/400/birthday", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "seasons", title: "Seasons", icon: "🍂", image: "https://loremflickr.com/600/400/autumn", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "morning-routine", title: "Morning Routine", icon: "🌅", image: "https://loremflickr.com/600/400/sunrise", topics: ["Speaking", "Present tense", "Vocabulary"] },
    { key: "night-routine", title: "Night Routine", icon: "🌙", image: "https://loremflickr.com/600/400/night", topics: ["Speaking", "Present tense", "Vocabulary"] },
    { key: "grocery-store", title: "Grocery Store", icon: "🛍️", image: "https://loremflickr.com/600/400/groceries", topics: ["Speaking", "Numbers & prices", "Vocabulary"] },
    { key: "at-the-bakery", title: "At the Bakery", icon: "🥐", image: "https://loremflickr.com/600/400/bakery", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "fruits-vegetables", title: "Fruits & Vegetables", icon: "🍎", image: "https://loremflickr.com/600/400/fruits", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "at-the-cafe", title: "At the Café", icon: "☕", image: "https://loremflickr.com/600/400/cafe", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "post-office", title: "Post Office", icon: "📮", image: "https://loremflickr.com/600/400/postoffice", topics: ["Speaking", "Vocabulary", "Polite requests"] },
    { key: "at-the-bank-basic", title: "Simple Banking", icon: "💰", image: "https://loremflickr.com/600/400/money", topics: ["Speaking", "Numbers & prices", "Vocabulary"] },
    { key: "using-phone-basic", title: "Using the Phone", icon: "📱", image: "https://loremflickr.com/600/400/smartphone", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "hairdresser", title: "At the Hairdresser", icon: "💇", image: "https://loremflickr.com/600/400/hairsalon", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "at-the-gym-basic", title: "At the Gym", icon: "🏃", image: "https://loremflickr.com/600/400/gym", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "cinema-movies", title: "Going to the Cinema", icon: "🎬", image: "https://loremflickr.com/600/400/cinema", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "at-the-library", title: "At the Library", icon: "📖", image: "https://loremflickr.com/600/400/library", topics: ["Speaking", "Vocabulary", "Polite requests"] },
    { key: "swimming-pool", title: "At the Swimming Pool", icon: "🏊", image: "https://loremflickr.com/600/400/swimmingpool", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "playground", title: "At the Playground", icon: "🛝", image: "https://loremflickr.com/600/400/playground", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "car-basic", title: "Cars & Driving", icon: "🚗", image: "https://loremflickr.com/600/400/car", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "bicycle", title: "Riding a Bicycle", icon: "🚲", image: "https://loremflickr.com/600/400/bicycle", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "at-the-zoo", title: "At the Zoo", icon: "🦁", image: "https://loremflickr.com/600/400/zoo", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "beach-basic", title: "At the Beach", icon: "🏖️", image: "https://loremflickr.com/600/400/beach", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "mountains-hiking", title: "Mountains & Hiking", icon: "⛰️", image: "https://loremflickr.com/600/400/mountain", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "camping-basic", title: "Camping", icon: "⛺", image: "https://loremflickr.com/600/400/camping", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "wedding-basic", title: "Weddings", icon: "💍", image: "https://loremflickr.com/600/400/wedding", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "festivals-basic", title: "Festivals & Celebrations", icon: "🎉", image: "https://loremflickr.com/600/400/festival", topics: ["Speaking", "Vocabulary", "Cultural expressions"] },
    { key: "music-basic", title: "Music & Songs", icon: "🎵", image: "https://loremflickr.com/600/400/music", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "dance-basic", title: "Dance", icon: "💃", image: "https://loremflickr.com/600/400/dance", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "cooking-basics", title: "Simple Cooking", icon: "🍲", image: "https://loremflickr.com/600/400/cooking", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "breakfast", title: "Breakfast Talk", icon: "🍳", image: "https://loremflickr.com/600/400/breakfast", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "lunch-dinner", title: "Lunch & Dinner", icon: "🍛", image: "https://loremflickr.com/600/400/dinner", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "street-food", title: "Street Food", icon: "🌮", image: "https://loremflickr.com/600/400/streetfood", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "at-the-farm", title: "At the Farm", icon: "🚜", image: "https://loremflickr.com/600/400/farm", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "garden-plants", title: "Garden & Plants", icon: "🌱", image: "https://loremflickr.com/600/400/garden", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "insects-nature", title: "Insects & Nature", icon: "🦋", image: "https://loremflickr.com/600/400/nature", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "birds", title: "Birds", icon: "🐦", image: "https://loremflickr.com/600/400/birds", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "sky-space-basic", title: "Sky & Space", icon: "🌌", image: "https://loremflickr.com/600/400/stars", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "rain-storms", title: "Rain & Storms", icon: "🌧️", image: "https://loremflickr.com/600/400/rain", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "days-of-week", title: "Planning the Week", icon: "🗓️", image: "https://loremflickr.com/600/400/planner", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "telling-time", title: "Telling the Time", icon: "🕐", image: "https://loremflickr.com/600/400/clock", topics: ["Speaking", "Numbers & prices", "Vocabulary"] },
    { key: "at-office-basic", title: "First Day at Work", icon: "🗂️", image: "https://loremflickr.com/600/400/office", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "classroom-basic", title: "In the Classroom", icon: "🏫", image: "https://loremflickr.com/600/400/classroom", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "exams-tests", title: "Exams & Tests", icon: "📝", image: "https://loremflickr.com/600/400/exam", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "friendship-basic", title: "Making Friends", icon: "🤗", image: "https://loremflickr.com/600/400/friends", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "neighbors", title: "Neighbors", icon: "🏘️", image: "https://loremflickr.com/600/400/neighborhood", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "at-post-office-basic", title: "Sending a Letter", icon: "✉️", image: "https://loremflickr.com/600/400/letter", topics: ["Speaking", "Vocabulary", "Polite requests"] },
    { key: "colors-of-clothes", title: "Choosing Clothes", icon: "👗", image: "https://loremflickr.com/600/400/clothes", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "shoes-shopping", title: "Buying Shoes", icon: "👟", image: "https://loremflickr.com/600/400/shoes", topics: ["Speaking", "Numbers & prices", "Vocabulary"] },
    { key: "jewelry-basic", title: "Jewelry & Accessories", icon: "💎", image: "https://loremflickr.com/600/400/jewelry", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "hair-styles", title: "Hair Styles", icon: "💈", image: "https://loremflickr.com/600/400/hairstyle", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "body-parts", title: "Body Parts", icon: "🧍", image: "https://loremflickr.com/600/400/anatomy", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "at-pharmacy", title: "At the Pharmacy", icon: "💊", image: "https://loremflickr.com/600/400/pharmacy", topics: ["Speaking", "Vocabulary", "Describing symptoms"] },
    { key: "dentist-basic", title: "At the Dentist", icon: "🦷", image: "https://loremflickr.com/600/400/dentist", topics: ["Speaking", "Vocabulary", "Describing symptoms"] },
    { key: "exercise-basic", title: "Exercise & Fitness", icon: "🤸", image: "https://loremflickr.com/600/400/exercise", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "sleep-rest", title: "Sleep & Rest", icon: "😴", image: "https://loremflickr.com/600/400/sleep", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "cleaning-house", title: "Cleaning the House", icon: "🧹", image: "https://loremflickr.com/600/400/cleaning", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "laundry", title: "Doing Laundry", icon: "🧺", image: "https://loremflickr.com/600/400/laundry", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "furniture-basic", title: "Furniture & Rooms", icon: "🛋️", image: "https://loremflickr.com/600/400/furniture", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "moving-house", title: "Moving House", icon: "📦", image: "https://loremflickr.com/600/400/movingboxes", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "neighborhood-places", title: "Places in the City", icon: "🏙️", image: "https://loremflickr.com/600/400/cityscape", topics: ["Speaking", "Vocabulary", "Prepositions"] },
    { key: "taxi-basic", title: "Taking a Taxi", icon: "🚕", image: "https://loremflickr.com/600/400/taxi", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "train-travel-basic", title: "Taking a Train", icon: "🚆", image: "https://loremflickr.com/600/400/train", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "airport-basic", title: "At the Airport (Basic)", icon: "🛫", image: "https://loremflickr.com/600/400/airport", topics: ["Speaking", "Vocabulary", "Polite requests"] },
    { key: "hotel-checkin-basic", title: "Hotel Check-in", icon: "🛎️", image: "https://loremflickr.com/600/400/hotel", topics: ["Speaking", "Vocabulary", "Polite requests"] },
    { key: "map-reading", title: "Reading a Map", icon: "🗺️", image: "https://loremflickr.com/600/400/map", topics: ["Speaking", "Prepositions", "Vocabulary"] },
    { key: "weather-forecast", title: "Weather Forecast", icon: "☀️", image: "https://loremflickr.com/600/400/sunny", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "seasons-clothes", title: "Dressing for Weather", icon: "🧥", image: "https://loremflickr.com/600/400/coat", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "holidays-basic", title: "Public Holidays", icon: "🎊", image: "https://loremflickr.com/600/400/holiday", topics: ["Speaking", "Vocabulary", "Cultural expressions"] },
    { key: "new-year", title: "New Year Celebration", icon: "🎆", image: "https://loremflickr.com/600/400/fireworks", topics: ["Speaking", "Vocabulary", "Cultural expressions"] },
    { key: "picnics", title: "Picnics", icon: "🧺", image: "https://loremflickr.com/600/400/picnic", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "toys-games-basic", title: "Toys & Games", icon: "🧸", image: "https://loremflickr.com/600/400/toys", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "board-games", title: "Board Games", icon: "🎲", image: "https://loremflickr.com/600/400/boardgame", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "photography-basic", title: "Taking Photos", icon: "📷", image: "https://loremflickr.com/600/400/camera", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "drawing-basic", title: "Drawing & Painting", icon: "🖌️", image: "https://loremflickr.com/600/400/painting", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "reading-books-basic", title: "Reading Books", icon: "📚", image: "https://loremflickr.com/600/400/books", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "tv-watching", title: "Watching TV", icon: "📺", image: "https://loremflickr.com/600/400/television", topics: ["Speaking", "Vocabulary", "Small talk"] },
    { key: "video-games-basic", title: "Video Games", icon: "🎮", image: "https://loremflickr.com/600/400/videogames", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "cooking-together", title: "Cooking Together", icon: "👩‍🍳", image: "https://loremflickr.com/600/400/cookingtogether", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "washing-dishes", title: "Washing Dishes", icon: "🍽️", image: "https://loremflickr.com/600/400/dishwashing", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "grandparents", title: "Grandparents", icon: "👵", image: "https://loremflickr.com/600/400/grandparents", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "babies-children", title: "Babies & Children", icon: "👶", image: "https://loremflickr.com/600/400/baby", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "school-supplies", title: "School Supplies", icon: "🎒", image: "https://loremflickr.com/600/400/schoolsupplies", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "teacher-student", title: "Teacher & Student Talk", icon: "🍎", image: "https://loremflickr.com/600/400/teacher", topics: ["Speaking", "Vocabulary", "Polite requests"] },
    { key: "homework", title: "Homework", icon: "📓", image: "https://loremflickr.com/600/400/homework", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "counting-money", title: "Counting Money", icon: "💵", image: "https://loremflickr.com/600/400/cash", topics: ["Speaking", "Numbers & prices", "Vocabulary"] },
    { key: "asking-help", title: "Asking for Help", icon: "🙋", image: "https://loremflickr.com/600/400/helping", topics: ["Speaking", "Polite requests", "Vocabulary"] },
    { key: "saying-sorry", title: "Apologizing Politely", icon: "🙏", image: "https://loremflickr.com/600/400/apology", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "giving-compliments", title: "Giving Compliments", icon: "😊", image: "https://loremflickr.com/600/400/smile", topics: ["Speaking", "Vocabulary", "Small talk"] },
  ],
  intermediate: [
    { key: "interview", title: "Job Interview", icon: "💼", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Formal grammar", "Professional vocabulary"] },
    { key: "travel", title: "Travel & Airport", icon: "✈️", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Vocabulary", "Polite requests"] },
    { key: "food", title: "Restaurant & Food", icon: "🍽️", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Vocabulary", "Ordering phrases"] },
    { key: "daily", title: "Daily Conversation", icon: "💬", image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Listening", "Natural expressions"] },
    { key: "phone", title: "Phone Calls", icon: "📞", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Listening", "Formal phrases"] },
    { key: "shopping-bargain", title: "Shopping & Bargaining", icon: "🛍️", image: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Negotiation phrases", "Vocabulary"] },
    { key: "healthcare", title: "Hospital & Health", icon: "🏥", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Vocabulary", "Formal requests"] },
    { key: "technology", title: "Technology & Gadgets", icon: "💻", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Vocabulary", "Explaining problems"] },
    { key: "emergency", title: "Emergency Situations", icon: "🚨", image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Urgent phrases", "Vocabulary"] },
    { key: "banking-money", title: "Banking & Money", icon: "🏦", image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Vocabulary", "Formal requests"] },
    { key: "housing-rent", title: "Housing & Rent", icon: "🏠", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Vocabulary", "Polite requests"] },
    { key: "social-media", title: "Social Media", icon: "📱", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Listening", "Natural expressions"] },
    { key: "sports-fitness", title: "Sports & Fitness", icon: "🏋️", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "job-application", title: "Job Application & Resume", icon: "📄", image: "https://loremflickr.com/600/400/resume", topics: ["Speaking", "Professional vocabulary", "Formal grammar"] },
    { key: "workplace-conflict", title: "Workplace Conflict", icon: "⚡", image: "https://loremflickr.com/600/400/office,argument", topics: ["Speaking", "Diplomatic phrases", "Vocabulary"] },
    { key: "team-collaboration", title: "Team Collaboration", icon: "🧩", image: "https://loremflickr.com/600/400/teamwork", topics: ["Speaking", "Professional vocabulary", "Everyday phrases"] },
    { key: "giving-presentations", title: "Giving Presentations", icon: "📽️", image: "https://loremflickr.com/600/400/presentation", topics: ["Speaking", "Formal grammar", "Professional vocabulary"] },
    { key: "time-management", title: "Time Management", icon: "⏰", image: "https://loremflickr.com/600/400/planner,desk", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "freelancing-gig-work", title: "Freelancing & Gig Work", icon: "🧑‍💻", image: "https://loremflickr.com/600/400/freelancer,laptop", topics: ["Speaking", "Negotiation phrases", "Vocabulary"] },
    { key: "remote-work", title: "Remote Work", icon: "🏡", image: "https://loremflickr.com/600/400/remote,work", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "office-small-talk", title: "Office Small Talk", icon: "☕", image: "https://loremflickr.com/600/400/coworkers,chat", topics: ["Speaking", "Small talk", "Natural expressions"] },
    { key: "performance-review", title: "Performance Review", icon: "📋", image: "https://loremflickr.com/600/400/performance,review", topics: ["Speaking", "Formal grammar", "Professional vocabulary"] },
    { key: "networking-events", title: "Networking Events", icon: "🎟️", image: "https://loremflickr.com/600/400/networking,event", topics: ["Speaking", "Professional vocabulary", "Small talk"] },
    { key: "public-transportation-issues", title: "Public Transportation Issues", icon: "🚏", image: "https://loremflickr.com/600/400/subway,station", topics: ["Speaking", "Vocabulary", "Explaining problems"] },
    { key: "renting-a-car", title: "Renting a Car", icon: "🚙", image: "https://loremflickr.com/600/400/car,rental", topics: ["Speaking", "Vocabulary", "Formal requests"] },
    { key: "lost-luggage", title: "Lost Luggage", icon: "🧳", image: "https://loremflickr.com/600/400/airport,luggage", topics: ["Speaking", "Vocabulary", "Explaining problems"] },
    { key: "visa-immigration", title: "Visa & Immigration", icon: "🛂", image: "https://loremflickr.com/600/400/passport,visa", topics: ["Speaking", "Formal grammar", "Vocabulary"] },
    { key: "customs-border-control", title: "Customs & Border Control", icon: "🛃", image: "https://loremflickr.com/600/400/customs,checkpoint", topics: ["Speaking", "Formal requests", "Vocabulary"] },
    { key: "hotel-complaints", title: "Hotel Complaints", icon: "🏨", image: "https://loremflickr.com/600/400/hotel,front,desk", topics: ["Speaking", "Diplomatic phrases", "Vocabulary"] },
    { key: "restaurant-complaints", title: "Restaurant Complaints", icon: "🍝", image: "https://loremflickr.com/600/400/restaurant,manager", topics: ["Speaking", "Diplomatic phrases", "Vocabulary"] },
    { key: "online-shopping-returns", title: "Online Shopping Returns", icon: "📦", image: "https://loremflickr.com/600/400/package,return", topics: ["Speaking", "Formal requests", "Vocabulary"] },
    { key: "customer-support-chat", title: "Customer Support Chat", icon: "🎧", image: "https://loremflickr.com/600/400/call,center", topics: ["Speaking", "Formal phrases", "Vocabulary"] },
    { key: "tech-troubleshooting", title: "Tech Troubleshooting", icon: "🛠️", image: "https://loremflickr.com/600/400/tech,support", topics: ["Speaking", "Vocabulary", "Explaining problems"] },
    { key: "software-subscriptions", title: "Software Subscriptions", icon: "💳", image: "https://loremflickr.com/600/400/subscription,billing", topics: ["Speaking", "Formal requests", "Vocabulary"] },
    { key: "social-media-etiquette", title: "Social Media Etiquette", icon: "🤳", image: "https://loremflickr.com/600/400/social,media,phone", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "online-dating", title: "Online Dating", icon: "💌", image: "https://loremflickr.com/600/400/coffee,date", topics: ["Speaking", "Small talk", "Natural expressions"] },
    { key: "making-small-talk-parties", title: "Making Small Talk at Parties", icon: "🎈", image: "https://loremflickr.com/600/400/house,party", topics: ["Speaking", "Small talk", "Natural expressions"] },
    { key: "neighborhood-disputes", title: "Neighborhood Disputes", icon: "🏘️", image: "https://loremflickr.com/600/400/neighbors,talking", topics: ["Speaking", "Diplomatic phrases", "Vocabulary"] },
    { key: "roommate-agreements", title: "Roommate Agreements", icon: "🔑", image: "https://loremflickr.com/600/400/roommates,apartment", topics: ["Speaking", "Negotiation phrases", "Vocabulary"] },
    { key: "moving-to-a-new-city", title: "Moving to a New City", icon: "🏙️", image: "https://loremflickr.com/600/400/new,city", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "apartment-hunting", title: "Apartment Hunting", icon: "🔍", image: "https://loremflickr.com/600/400/apartment,tour", topics: ["Speaking", "Formal requests", "Vocabulary"] },
    { key: "home-repairs", title: "Home Repairs", icon: "🔧", image: "https://loremflickr.com/600/400/home,repair", topics: ["Speaking", "Vocabulary", "Explaining problems"] },
    { key: "insurance-claims", title: "Insurance Claims", icon: "🛡️", image: "https://loremflickr.com/600/400/insurance,paperwork", topics: ["Speaking", "Formal grammar", "Vocabulary"] },
    { key: "car-trouble-mechanics", title: "Car Trouble & Mechanics", icon: "🔩", image: "https://loremflickr.com/600/400/car,mechanic", topics: ["Speaking", "Vocabulary", "Explaining problems"] },
    { key: "traffic-parking", title: "Traffic & Parking", icon: "🚦", image: "https://loremflickr.com/600/400/traffic,jam", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "public-speaking", title: "Public Speaking", icon: "🎙️", image: "https://loremflickr.com/600/400/public,speaking", topics: ["Speaking", "Formal grammar", "Confidence building"] },
    { key: "volunteering", title: "Volunteering", icon: "🤲", image: "https://loremflickr.com/600/400/volunteers,group", topics: ["Speaking", "Vocabulary", "Formal requests"] },
    { key: "charity-fundraising", title: "Charity & Fundraising", icon: "🎗️", image: "https://loremflickr.com/600/400/charity,event", topics: ["Speaking", "Vocabulary", "Persuasive language"] },
    { key: "community-events", title: "Community Events", icon: "🎪", image: "https://loremflickr.com/600/400/community,fair", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "local-government-services", title: "Local Government Services", icon: "🏢", image: "https://loremflickr.com/600/400/government,office", topics: ["Speaking", "Formal requests", "Vocabulary"] },
    { key: "environmental-habits", title: "Environmental Habits", icon: "♻️", image: "https://loremflickr.com/600/400/recycling", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "recycling-waste", title: "Recycling & Waste Management", icon: "🗑️", image: "https://loremflickr.com/600/400/waste,sorting", topics: ["Speaking", "Vocabulary", "Formal requests"] },
    { key: "personal-finance-planning", title: "Personal Finance Planning", icon: "📊", image: "https://loremflickr.com/600/400/budget,planning", topics: ["Speaking", "Formal vocabulary", "Numbers & prices"] },
    { key: "investing-basics", title: "Investing Basics", icon: "📈", image: "https://loremflickr.com/600/400/stock,market", topics: ["Speaking", "Formal vocabulary", "Analytical vocabulary"] },
    { key: "taxes", title: "Taxes", icon: "🧾", image: "https://loremflickr.com/600/400/tax,forms", topics: ["Speaking", "Formal grammar", "Vocabulary"] },
    { key: "job-promotion-discussion", title: "Job Promotion Discussion", icon: "🎯", image: "https://loremflickr.com/600/400/handshake,office", topics: ["Speaking", "Professional vocabulary", "Formal grammar"] },
    { key: "quitting-a-job", title: "Quitting a Job", icon: "🚪", image: "https://loremflickr.com/600/400/resignation,letter", topics: ["Speaking", "Diplomatic phrases", "Professional vocabulary"] },
    { key: "starting-a-business", title: "Starting a Business", icon: "🚀", image: "https://loremflickr.com/600/400/startup,idea", topics: ["Speaking", "Professional vocabulary", "Analytical vocabulary"] },
    { key: "marketing-ideas", title: "Marketing Ideas", icon: "📣", image: "https://loremflickr.com/600/400/marketing,brainstorm", topics: ["Speaking", "Professional vocabulary", "Persuasive language"] },
    { key: "customer-feedback", title: "Customer Feedback", icon: "⭐", image: "https://loremflickr.com/600/400/feedback,form", topics: ["Speaking", "Diplomatic phrases", "Vocabulary"] },
    { key: "product-reviews", title: "Product Reviews", icon: "🛒", image: "https://loremflickr.com/600/400/product,review", topics: ["Speaking", "Descriptive vocabulary", "Natural expressions"] },
    { key: "online-learning-platforms", title: "Online Learning Platforms", icon: "💻", image: "https://loremflickr.com/600/400/online,course", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "studying-abroad", title: "Studying Abroad", icon: "🎓", image: "https://loremflickr.com/600/400/study,abroad", topics: ["Speaking", "Formal vocabulary", "Descriptions"] },
    { key: "language-learning-tips", title: "Language Learning Tips", icon: "🗣️", image: "https://loremflickr.com/600/400/language,book", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "tutoring-sessions", title: "Tutoring Sessions", icon: "📖", image: "https://loremflickr.com/600/400/tutoring,session", topics: ["Speaking", "Formal vocabulary", "Explaining ideas"] },
    { key: "parent-teacher-meetings", title: "Parent-Teacher Meetings", icon: "🍎", image: "https://loremflickr.com/600/400/parent,teacher", topics: ["Speaking", "Formal grammar", "Vocabulary"] },
    { key: "childcare-arrangements", title: "Childcare Arrangements", icon: "🧸", image: "https://loremflickr.com/600/400/childcare", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "family-gatherings", title: "Family Gatherings", icon: "👨‍👩‍👧‍👦", image: "https://loremflickr.com/600/400/family,dinner", topics: ["Speaking", "Small talk", "Natural expressions"] },
    { key: "wedding-planning", title: "Wedding Planning", icon: "💐", image: "https://loremflickr.com/600/400/wedding,planning", topics: ["Speaking", "Vocabulary", "Formal requests"] },
    { key: "anniversary-celebrations", title: "Anniversary Celebrations", icon: "🥂", image: "https://loremflickr.com/600/400/anniversary,celebration", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "health-insurance", title: "Health Insurance", icon: "📑", image: "https://loremflickr.com/600/400/health,insurance,form", topics: ["Speaking", "Formal vocabulary", "Formal requests"] },
    { key: "fitness-coaching", title: "Fitness Coaching", icon: "🏋️‍♀️", image: "https://loremflickr.com/600/400/personal,trainer", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "diet-nutrition", title: "Diet & Nutrition", icon: "🥗", image: "https://loremflickr.com/600/400/healthy,meal", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "mental-wellness", title: "Mental Wellness", icon: "🧘", image: "https://loremflickr.com/600/400/meditation", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "sleep-habits-discussion", title: "Sleep Habits Discussion", icon: "🛏️", image: "https://loremflickr.com/600/400/sleeping", topics: ["Speaking", "Vocabulary", "Everyday phrases"] },
    { key: "doctor-appointments", title: "Doctor Appointments", icon: "🩻", image: "https://loremflickr.com/600/400/doctor,appointment", topics: ["Speaking", "Formal requests", "Vocabulary"] },
    { key: "pharmacy-consultation", title: "Pharmacy Consultation", icon: "💊", image: "https://loremflickr.com/600/400/pharmacist,counter", topics: ["Speaking", "Vocabulary", "Formal requests"] },
    { key: "pet-care", title: "Pet Care", icon: "🐕", image: "https://loremflickr.com/600/400/dog,care", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "veterinarian-visit", title: "Veterinarian Visit", icon: "🐾", image: "https://loremflickr.com/600/400/vet,clinic", topics: ["Speaking", "Vocabulary", "Explaining problems"] },
    { key: "gardening-tips", title: "Gardening Tips", icon: "🌻", image: "https://loremflickr.com/600/400/gardening", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "home-decoration", title: "Home Decoration", icon: "🛋️", image: "https://loremflickr.com/600/400/home,decor", topics: ["Speaking", "Descriptive vocabulary", "Descriptions"] },
    { key: "diy-projects", title: "DIY Projects", icon: "🔨", image: "https://loremflickr.com/600/400/diy,project", topics: ["Speaking", "Vocabulary", "Explaining ideas"] },
    { key: "car-buying", title: "Car Buying", icon: "🚗", image: "https://loremflickr.com/600/400/car,dealership", topics: ["Speaking", "Negotiation phrases", "Vocabulary"] },
    { key: "real-estate-viewing", title: "Real Estate Viewing", icon: "🏘️", image: "https://loremflickr.com/600/400/house,viewing", topics: ["Speaking", "Formal requests", "Vocabulary"] },
    { key: "job-fair-networking", title: "Job Fair Networking", icon: "🎪", image: "https://loremflickr.com/600/400/job,fair", topics: ["Speaking", "Professional vocabulary", "Small talk"] },
    { key: "cover-letters", title: "Cover Letters", icon: "✉️", image: "https://loremflickr.com/600/400/cover,letter", topics: ["Speaking", "Formal grammar", "Professional vocabulary"] },
    { key: "linkedin-profile", title: "LinkedIn Profile", icon: "🔗", image: "https://loremflickr.com/600/400/linkedin,profile", topics: ["Speaking", "Professional vocabulary", "Formal grammar"] },
    { key: "salary-negotiation", title: "Salary Negotiation", icon: "💰", image: "https://loremflickr.com/600/400/salary,negotiation", topics: ["Speaking", "Negotiation phrases", "Professional vocabulary"] },
    { key: "workplace-training", title: "Workplace Training", icon: "📚", image: "https://loremflickr.com/600/400/workplace,training", topics: ["Speaking", "Professional vocabulary", "Formal requests"] },
    { key: "business-email-writing", title: "Business Email Writing", icon: "📧", image: "https://loremflickr.com/600/400/writing,email", topics: ["Speaking", "Formal grammar", "Professional vocabulary"] },
    { key: "conference-calls", title: "Conference Calls", icon: "📶", image: "https://loremflickr.com/600/400/conference,call", topics: ["Speaking", "Professional vocabulary", "Formal phrases"] },
    { key: "video-conferencing-etiquette", title: "Video Conferencing Etiquette", icon: "🎥", image: "https://loremflickr.com/600/400/video,call", topics: ["Speaking", "Vocabulary", "Professional vocabulary"] },
    { key: "cybersecurity-basics", title: "Cybersecurity Basics", icon: "🔒", image: "https://loremflickr.com/600/400/cybersecurity", topics: ["Speaking", "Vocabulary", "Explaining ideas"] },
    { key: "online-privacy", title: "Online Privacy", icon: "🕵️", image: "https://loremflickr.com/600/400/online,privacy", topics: ["Speaking", "Vocabulary", "Natural expressions"] },
    { key: "streaming-services", title: "Streaming Services", icon: "📺", image: "https://loremflickr.com/600/400/streaming,tv", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "music-streaming-choices", title: "Music Streaming Choices", icon: "🎧", image: "https://loremflickr.com/600/400/music,streaming", topics: ["Speaking", "Vocabulary", "Descriptions"] },
    { key: "podcast-discussion", title: "Podcast Discussion", icon: "🎙️", image: "https://loremflickr.com/600/400/podcast,recording", topics: ["Speaking", "Listening", "Analytical vocabulary"] },
    { key: "book-club-discussion", title: "Book Club Discussion", icon: "📕", image: "https://loremflickr.com/600/400/book,club", topics: ["Speaking", "Analytical vocabulary", "Descriptions"] },
    { key: "travel-planning-itineraries", title: "Travel Planning & Itineraries", icon: "🗺️", image: "https://loremflickr.com/600/400/travel,planning", topics: ["Speaking", "Vocabulary", "Formal requests"] },
    { key: "scheduling-meetings", title: "Scheduling Meetings", icon: "🗓️", image: "https://loremflickr.com/600/400/scheduling,meeting", topics: ["Speaking", "Professional vocabulary", "Formal phrases"] },
  ],
  advanced: [
    { key: "business", title: "Business Meeting", icon: "📊", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Advanced grammar", "Business vocabulary"] },
    { key: "debate", title: "Debates & Opinions", icon: "🗣️", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Argument structure", "Persuasive language"] },
    { key: "idioms", title: "Idioms & Slang", icon: "🎭", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80", topics: ["Vocabulary", "Speaking", "Cultural expressions"] },
    { key: "negotiation", title: "Negotiation", icon: "🤝", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Persuasive grammar", "Vocabulary"] },
    { key: "news", title: "News Discussion", icon: "📰", image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=600&q=80", topics: ["Listening", "Speaking", "Current-affairs vocabulary"] },
    { key: "academic", title: "Academic Discussion", icon: "🎓", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Formal grammar", "Analytical vocabulary"] },
    { key: "environment", title: "Environment & Climate", icon: "🌍", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Listening", "Topic-specific vocabulary"] },
    { key: "legal", title: "Legal & Formal Matters", icon: "⚖️", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Formal grammar", "Legal vocabulary"] },
    { key: "politics-government", title: "Politics & Government", icon: "🏛️", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Listening", "Current-affairs vocabulary"] },
    { key: "science-innovation", title: "Science & Innovation", icon: "🔬", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Analytical vocabulary", "Formal grammar"] },
    { key: "art-culture", title: "Art & Culture", icon: "🖼️", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=600&q=80", topics: ["Vocabulary", "Speaking", "Cultural expressions"] },
    { key: "career-development", title: "Career Development", icon: "📈", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", topics: ["Speaking", "Business vocabulary", "Advanced grammar"] },
    { key: "crisis-management", title: "Crisis Management", icon: "🧯", image: "https://loremflickr.com/600/400/crisis,meeting", topics: ["Speaking", "Advanced grammar", "Analytical vocabulary"] },
    { key: "mergers-acquisitions", title: "Mergers & Acquisitions", icon: "🏢", image: "https://loremflickr.com/600/400/business,merger", topics: ["Speaking", "Business vocabulary", "Formal grammar"] },
    { key: "philosophy-ethics", title: "Philosophy & Ethics", icon: "🤔", image: "https://loremflickr.com/600/400/philosophy,book", topics: ["Speaking", "Analytical vocabulary", "Advanced grammar"] },
    { key: "psychology-behavior", title: "Psychology & Human Behavior", icon: "🧠", image: "https://loremflickr.com/600/400/psychology,discussion", topics: ["Speaking", "Analytical vocabulary", "Formal grammar"] },
    { key: "economics-markets", title: "Economics & Markets", icon: "💹", image: "https://loremflickr.com/600/400/stock,charts", topics: ["Speaking", "Analytical vocabulary", "Current-affairs vocabulary"] },
    { key: "international-relations", title: "International Relations", icon: "🌐", image: "https://loremflickr.com/600/400/world,map", topics: ["Speaking", "Current-affairs vocabulary", "Advanced grammar"] },
    { key: "history-analysis", title: "Historical Analysis", icon: "📜", image: "https://loremflickr.com/600/400/history,books", topics: ["Speaking", "Analytical vocabulary", "Formal grammar"] },
    { key: "literature-critique", title: "Literature Critique", icon: "📖", image: "https://loremflickr.com/600/400/literature,analysis", topics: ["Speaking", "Analytical vocabulary", "Cultural expressions"] },
    { key: "film-analysis", title: "Film Analysis", icon: "🎬", image: "https://loremflickr.com/600/400/cinema,critic", topics: ["Speaking", "Analytical vocabulary", "Cultural expressions"] },
    { key: "architecture-design", title: "Architecture & Design", icon: "🏛️", image: "https://loremflickr.com/600/400/architecture,design", topics: ["Speaking", "Analytical vocabulary", "Descriptions"] },
    { key: "artificial-intelligence", title: "Artificial Intelligence", icon: "🤖", image: "https://loremflickr.com/600/400/ai,technology", topics: ["Speaking", "Analytical vocabulary", "Technical vocabulary"] },
    { key: "space-exploration", title: "Space Exploration", icon: "🚀", image: "https://loremflickr.com/600/400/space,rocket", topics: ["Speaking", "Analytical vocabulary", "Scientific vocabulary"] },
    { key: "climate-policy", title: "Climate Policy", icon: "🌡️", image: "https://loremflickr.com/600/400/climate,policy", topics: ["Speaking", "Current-affairs vocabulary", "Advanced grammar"] },
    { key: "healthcare-policy", title: "Healthcare Policy", icon: "🏥", image: "https://loremflickr.com/600/400/healthcare,policy", topics: ["Speaking", "Current-affairs vocabulary", "Formal grammar"] },
    { key: "education-reform", title: "Education Reform", icon: "🏫", image: "https://loremflickr.com/600/400/classroom,policy", topics: ["Speaking", "Analytical vocabulary", "Current-affairs vocabulary"] },
    { key: "media-journalism", title: "Media & Journalism", icon: "📰", image: "https://loremflickr.com/600/400/journalism,newsroom", topics: ["Speaking", "Current-affairs vocabulary", "Analytical vocabulary"] },
    { key: "public-speaking-advanced", title: "Advanced Public Speaking", icon: "🎤", image: "https://loremflickr.com/600/400/keynote,speech", topics: ["Speaking", "Persuasive language", "Advanced grammar"] },
    { key: "cross-cultural-communication", title: "Cross-Cultural Communication", icon: "🌍", image: "https://loremflickr.com/600/400/cultural,exchange", topics: ["Speaking", "Cultural expressions", "Advanced grammar"] },
    { key: "leadership-management", title: "Leadership & Management", icon: "🧑‍💼", image: "https://loremflickr.com/600/400/leadership,team", topics: ["Speaking", "Business vocabulary", "Advanced grammar"] },
    { key: "startup-pitching", title: "Startup Pitching", icon: "🚀", image: "https://loremflickr.com/600/400/startup,pitch", topics: ["Speaking", "Persuasive language", "Business vocabulary"] },
    { key: "venture-capital", title: "Venture Capital & Investment", icon: "💼", image: "https://loremflickr.com/600/400/venture,capital", topics: ["Speaking", "Business vocabulary", "Formal grammar"] },
    { key: "supply-chain-logistics", title: "Supply Chain & Logistics", icon: "🚛", image: "https://loremflickr.com/600/400/supply,chain", topics: ["Speaking", "Business vocabulary", "Analytical vocabulary"] },
    { key: "cybersecurity-advanced", title: "Cybersecurity Strategy", icon: "🔐", image: "https://loremflickr.com/600/400/cybersecurity,strategy", topics: ["Speaking", "Technical vocabulary", "Analytical vocabulary"] },
    { key: "data-science-analytics", title: "Data Science & Analytics", icon: "📊", image: "https://loremflickr.com/600/400/data,analytics", topics: ["Speaking", "Technical vocabulary", "Analytical vocabulary"] },
    { key: "product-management", title: "Product Management", icon: "🧭", image: "https://loremflickr.com/600/400/product,roadmap", topics: ["Speaking", "Business vocabulary", "Analytical vocabulary"] },
    { key: "ux-design-critique", title: "UX Design Critique", icon: "🎨", image: "https://loremflickr.com/600/400/ux,design", topics: ["Speaking", "Technical vocabulary", "Descriptions"] },
    { key: "legal-contracts-advanced", title: "Contract Negotiation", icon: "📑", image: "https://loremflickr.com/600/400/contract,negotiation", topics: ["Speaking", "Legal vocabulary", "Formal grammar"] },
    { key: "intellectual-property", title: "Intellectual Property", icon: "©️", image: "https://loremflickr.com/600/400/patent,documents", topics: ["Speaking", "Legal vocabulary", "Formal grammar"] },
    { key: "mediation-arbitration", title: "Mediation & Arbitration", icon: "⚖️", image: "https://loremflickr.com/600/400/mediation,table", topics: ["Speaking", "Diplomatic phrases", "Legal vocabulary"] },
    { key: "diplomacy-negotiation", title: "Diplomacy & High-Stakes Negotiation", icon: "🕊️", image: "https://loremflickr.com/600/400/diplomatic,talks", topics: ["Speaking", "Diplomatic phrases", "Advanced grammar"] },
    { key: "scientific-research", title: "Scientific Research Discussion", icon: "🔬", image: "https://loremflickr.com/600/400/science,lab", topics: ["Speaking", "Scientific vocabulary", "Analytical vocabulary"] },
    { key: "medical-ethics", title: "Medical Ethics", icon: "⚕️", image: "https://loremflickr.com/600/400/medical,ethics", topics: ["Speaking", "Analytical vocabulary", "Formal grammar"] },
    { key: "genetics-biotechnology", title: "Genetics & Biotechnology", icon: "🧬", image: "https://loremflickr.com/600/400/genetics,lab", topics: ["Speaking", "Scientific vocabulary", "Analytical vocabulary"] },
    { key: "renewable-energy", title: "Renewable Energy", icon: "🔋", image: "https://loremflickr.com/600/400/solar,panels", topics: ["Speaking", "Technical vocabulary", "Current-affairs vocabulary"] },
    { key: "urban-planning", title: "Urban Planning", icon: "🏙️", image: "https://loremflickr.com/600/400/urban,planning", topics: ["Speaking", "Analytical vocabulary", "Descriptions"] },
    { key: "globalization-trade", title: "Globalization & Trade", icon: "🌐", image: "https://loremflickr.com/600/400/global,trade", topics: ["Speaking", "Current-affairs vocabulary", "Analytical vocabulary"] },
    { key: "social-inequality", title: "Social Inequality", icon: "⚖️", image: "https://loremflickr.com/600/400/social,issues", topics: ["Speaking", "Analytical vocabulary", "Current-affairs vocabulary"] },
    { key: "immigration-debate", title: "Immigration & Society", icon: "🛂", image: "https://loremflickr.com/600/400/immigration,topic", topics: ["Speaking", "Current-affairs vocabulary", "Advanced grammar"] },
    { key: "technology-ethics", title: "Technology Ethics", icon: "🤖", image: "https://loremflickr.com/600/400/tech,ethics", topics: ["Speaking", "Analytical vocabulary", "Advanced grammar"] },
    { key: "future-of-work", title: "The Future of Work", icon: "🏢", image: "https://loremflickr.com/600/400/future,workplace", topics: ["Speaking", "Business vocabulary", "Analytical vocabulary"] },
    { key: "startup-failure-lessons", title: "Startup Failure & Lessons Learned", icon: "📉", image: "https://loremflickr.com/600/400/startup,failure", topics: ["Speaking", "Business vocabulary", "Analytical vocabulary"] },
    { key: "brand-strategy", title: "Brand Strategy", icon: "🏷️", image: "https://loremflickr.com/600/400/brand,strategy", topics: ["Speaking", "Business vocabulary", "Persuasive language"] },
    { key: "crisis-communication", title: "Crisis Communication", icon: "📢", image: "https://loremflickr.com/600/400/press,conference", topics: ["Speaking", "Business vocabulary", "Diplomatic phrases"] },
    { key: "investor-relations", title: "Investor Relations", icon: "📈", image: "https://loremflickr.com/600/400/shareholder,meeting", topics: ["Speaking", "Business vocabulary", "Formal grammar"] },
    { key: "corporate-governance", title: "Corporate Governance", icon: "🏛️", image: "https://loremflickr.com/600/400/boardroom,meeting", topics: ["Speaking", "Business vocabulary", "Formal grammar"] },
    { key: "philosophy-of-science", title: "Philosophy of Science", icon: "🔭", image: "https://loremflickr.com/600/400/science,philosophy", topics: ["Speaking", "Analytical vocabulary", "Advanced grammar"] },
    { key: "existentialism-meaning", title: "Existentialism & Meaning", icon: "🌌", image: "https://loremflickr.com/600/400/existential,thought", topics: ["Speaking", "Analytical vocabulary", "Advanced grammar"] },
    { key: "art-history", title: "Art History", icon: "🖼️", image: "https://loremflickr.com/600/400/art,museum", topics: ["Speaking", "Cultural expressions", "Analytical vocabulary"] },
    { key: "classical-music", title: "Classical Music Appreciation", icon: "🎼", image: "https://loremflickr.com/600/400/classical,music", topics: ["Speaking", "Cultural expressions", "Descriptions"] },
    { key: "theatre-performance", title: "Theatre & Performance Arts", icon: "🎭", image: "https://loremflickr.com/600/400/theatre,stage", topics: ["Speaking", "Cultural expressions", "Analytical vocabulary"] },
    { key: "architecture-sustainability", title: "Sustainable Architecture", icon: "🏗️", image: "https://loremflickr.com/600/400/green,building", topics: ["Speaking", "Technical vocabulary", "Analytical vocabulary"] },
    { key: "anthropology-culture", title: "Anthropology & Culture", icon: "🗿", image: "https://loremflickr.com/600/400/cultural,anthropology", topics: ["Speaking", "Cultural expressions", "Analytical vocabulary"] },
    { key: "linguistics-language", title: "Linguistics & Language Structure", icon: "🔤", image: "https://loremflickr.com/600/400/linguistics,study", topics: ["Speaking", "Analytical vocabulary", "Formal grammar"] },
    { key: "game-theory", title: "Game Theory & Strategy", icon: "♟️", image: "https://loremflickr.com/600/400/chess,strategy", topics: ["Speaking", "Analytical vocabulary", "Advanced grammar"] },
    { key: "behavioral-economics", title: "Behavioral Economics", icon: "🧮", image: "https://loremflickr.com/600/400/behavioral,economics", topics: ["Speaking", "Analytical vocabulary", "Formal grammar"] },
    { key: "negotiation-tactics-advanced", title: "Advanced Negotiation Tactics", icon: "🤝", image: "https://loremflickr.com/600/400/negotiation,tactics", topics: ["Speaking", "Persuasive language", "Advanced grammar"] },
    { key: "risk-management", title: "Risk Management", icon: "⚠️", image: "https://loremflickr.com/600/400/risk,assessment", topics: ["Speaking", "Business vocabulary", "Analytical vocabulary"] },
    { key: "supply-demand-analysis", title: "Market Supply & Demand Analysis", icon: "📉", image: "https://loremflickr.com/600/400/market,analysis", topics: ["Speaking", "Analytical vocabulary", "Business vocabulary"] },
    { key: "cryptocurrency-blockchain", title: "Cryptocurrency & Blockchain", icon: "🪙", image: "https://loremflickr.com/600/400/cryptocurrency", topics: ["Speaking", "Technical vocabulary", "Analytical vocabulary"] },
    { key: "space-policy", title: "Space Policy & Law", icon: "🛰️", image: "https://loremflickr.com/600/400/satellite,space", topics: ["Speaking", "Legal vocabulary", "Technical vocabulary"] },
    { key: "bioethics-genetic-engineering", title: "Bioethics of Genetic Engineering", icon: "🧬", image: "https://loremflickr.com/600/400/genetic,engineering", topics: ["Speaking", "Analytical vocabulary", "Formal grammar"] },
    { key: "digital-transformation", title: "Digital Transformation", icon: "💻", image: "https://loremflickr.com/600/400/digital,transformation", topics: ["Speaking", "Business vocabulary", "Technical vocabulary"] },
    { key: "innovation-management", title: "Innovation Management", icon: "💡", image: "https://loremflickr.com/600/400/innovation,lab", topics: ["Speaking", "Business vocabulary", "Analytical vocabulary"] },
    { key: "customer-experience-strategy", title: "Customer Experience Strategy", icon: "🧑‍🤝‍🧑", image: "https://loremflickr.com/600/400/customer,experience", topics: ["Speaking", "Business vocabulary", "Analytical vocabulary"] },
    { key: "talent-acquisition", title: "Talent Acquisition & HR Strategy", icon: "🧑‍💼", image: "https://loremflickr.com/600/400/hr,interview", topics: ["Speaking", "Business vocabulary", "Formal grammar"] },
    { key: "workplace-culture-change", title: "Workplace Culture Change", icon: "🏢", image: "https://loremflickr.com/600/400/company,culture", topics: ["Speaking", "Business vocabulary", "Analytical vocabulary"] },
    { key: "public-health-policy", title: "Public Health Policy", icon: "🏥", image: "https://loremflickr.com/600/400/public,health", topics: ["Speaking", "Current-affairs vocabulary", "Formal grammar"] },
    { key: "food-security", title: "Global Food Security", icon: "🌾", image: "https://loremflickr.com/600/400/agriculture,field", topics: ["Speaking", "Current-affairs vocabulary", "Analytical vocabulary"] },
    { key: "water-resource-management", title: "Water Resource Management", icon: "💧", image: "https://loremflickr.com/600/400/water,resources", topics: ["Speaking", "Technical vocabulary", "Analytical vocabulary"] },
    { key: "disaster-response", title: "Disaster Response & Management", icon: "🌪️", image: "https://loremflickr.com/600/400/disaster,response", topics: ["Speaking", "Technical vocabulary", "Formal grammar"] },
    { key: "space-tourism", title: "Space Tourism", icon: "🛸", image: "https://loremflickr.com/600/400/space,tourism", topics: ["Speaking", "Technical vocabulary", "Current-affairs vocabulary"] },
    { key: "quantum-computing", title: "Quantum Computing", icon: "⚛️", image: "https://loremflickr.com/600/400/quantum,computer", topics: ["Speaking", "Scientific vocabulary", "Technical vocabulary"] },
    { key: "neuroscience-brain", title: "Neuroscience & the Brain", icon: "🧠", image: "https://loremflickr.com/600/400/brain,research", topics: ["Speaking", "Scientific vocabulary", "Analytical vocabulary"] },
    { key: "archaeology-discoveries", title: "Archaeology & Ancient Discoveries", icon: "🏺", image: "https://loremflickr.com/600/400/archaeology,dig", topics: ["Speaking", "Cultural expressions", "Analytical vocabulary"] },
    { key: "astronomy-cosmos", title: "Astronomy & the Cosmos", icon: "🌌", image: "https://loremflickr.com/600/400/astronomy,telescope", topics: ["Speaking", "Scientific vocabulary", "Analytical vocabulary"] },
    { key: "environmental-conservation-advanced", title: "Wildlife Conservation Strategy", icon: "🐘", image: "https://loremflickr.com/600/400/wildlife,conservation", topics: ["Speaking", "Scientific vocabulary", "Analytical vocabulary"] },
    { key: "renewable-vs-fossil-debate", title: "Renewable vs Fossil Fuels Debate", icon: "⛽", image: "https://loremflickr.com/600/400/energy,debate", topics: ["Speaking", "Persuasive language", "Current-affairs vocabulary"] },
    { key: "automation-jobs-debate", title: "Automation & Jobs Debate", icon: "🦾", image: "https://loremflickr.com/600/400/automation,factory", topics: ["Speaking", "Persuasive language", "Advanced grammar"] },
    { key: "social-media-impact-debate", title: "Social Media's Impact on Society", icon: "📱", image: "https://loremflickr.com/600/400/social,media,debate", topics: ["Speaking", "Persuasive language", "Current-affairs vocabulary"] },
    { key: "universal-basic-income", title: "Universal Basic Income Debate", icon: "💵", image: "https://loremflickr.com/600/400/ubi,debate", topics: ["Speaking", "Persuasive language", "Economic vocabulary"] },
    { key: "space-race-modern", title: "The New Space Race", icon: "🚀", image: "https://loremflickr.com/600/400/space,race", topics: ["Speaking", "Current-affairs vocabulary", "Analytical vocabulary"] },
    { key: "privacy-vs-security-debate", title: "Privacy vs Security Debate", icon: "🔍", image: "https://loremflickr.com/600/400/surveillance,debate", topics: ["Speaking", "Persuasive language", "Advanced grammar"] },
    { key: "genetic-privacy", title: "Genetic Privacy & Data", icon: "🧬", image: "https://loremflickr.com/600/400/genetic,data", topics: ["Speaking", "Analytical vocabulary", "Technical vocabulary"] },
    { key: "mental-health-workplace", title: "Mental Health in the Workplace", icon: "🧘‍♂️", image: "https://loremflickr.com/600/400/workplace,wellness", topics: ["Speaking", "Professional vocabulary", "Formal grammar"] },
    { key: "gender-equality-workplace", title: "Gender Equality in the Workplace", icon: "⚖️", image: "https://loremflickr.com/600/400/workplace,equality", topics: ["Speaking", "Professional vocabulary", "Formal grammar"] },
    { key: "aging-population", title: "Aging Population & Society", icon: "👴", image: "https://loremflickr.com/600/400/aging,society", topics: ["Speaking", "Analytical vocabulary", "Current-affairs vocabulary"] },
    { key: "smart-cities", title: "Smart Cities & Urban Technology", icon: "🏙️", image: "https://loremflickr.com/600/400/smart,city", topics: ["Speaking", "Technical vocabulary", "Analytical vocabulary"] },
    { key: "digital-currency-policy", title: "Digital Currency Policy", icon: "💱", image: "https://loremflickr.com/600/400/digital,currency", topics: ["Speaking", "Business vocabulary", "Formal grammar"] },
  ],
};
// loremflickr.com is unreliable (slow/times out often), causing broken
// image icons before the onError fallback can kick in. Swap it out
// proactively for a fast, always-reliable placeholder service instead
// of waiting for it to fail.
const reliableImage = (img, key) =>
  img && img.includes("loremflickr.com")
    ? `https://picsum.photos/seed/${encodeURIComponent(key)}/600/400`
    : img;
// Small count-up hook for the stat numbers — animates 0 → target whenever
// the target changes (e.g. once the async stats fetch resolves), so it
// doesn't lock onto a stale 0 from before the data arrived.
const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) return;
    let raf;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => raf && cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
};
const defaultAvatarFor = (user) => {
  if (!user) return null;
  if (user.avatarUrl) return user.avatarUrl;
  const seed = user.username || user.email || 'speakup';
  const style = user.gender === 'female' ? 'micah' : user.gender === 'male' ? 'adventurer' : 'adventurer-neutral';
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};
    
const LEVEL_LABELS = { basic: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export default function CategorySelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
  const [activeTopics, setActiveTopics] = useState([]); // multi-select filter chips
  const [stats, setStats] = useState(null); // { streakDays, lessonsCompleted, weeklyGoal, weeklyDone }
  const [openGroups, setOpenGroups] = useState({}); // { "Skill": true, ... } — dropdown open/closed state

  const level = user?.level || "basic";
  const allCategories = CATEGORIES_BY_LEVEL[level] || CATEGORIES_BY_LEVEL.basic;
  const showTextOption = level === "basic";

  useEffect(() => {
    api.get('/user/progress')
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  const lastCategorySlug = localStorage.getItem('lastCategorySlug');
  const lastCategory = lastCategorySlug ? allCategories.find((c) => c.key === lastCategorySlug) : null;

  const toggleGroup = (name) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // All unique topic tags available for this level, used to render filter chips.
  // Groups topics into 3 logical filter categories so the sidebar shows
  // separate, combinable filter blocks instead of one flat list.
  const classifyTopic = (t) => {
    const lower = t.toLowerCase();
    if (["speaking", "listening", "vocabulary"].includes(lower)) return "Skill";
    if (lower.includes("grammar") || lower.includes("tense") || lower === "prepositions") return "Grammar & Structure";
    return "Style & Focus";
  };

  const TOPIC_GROUP_ORDER = ["Skill", "Grammar & Structure", "Style & Focus"];

  const topicGroups = useMemo(() => {
    const buckets = { "Skill": new Set(), "Grammar & Structure": new Set(), "Style & Focus": new Set() };
    allCategories.forEach((c) => c.topics.forEach((t) => buckets[classifyTopic(t)].add(t)));
    return TOPIC_GROUP_ORDER
      .map((name) => ({ name, topics: Array.from(buckets[name]).sort() }))
      .filter((g) => g.topics.length > 0);
  }, [allCategories]);

  const toggleTopic = (topic) => {
    setActiveTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  // Filters by the search box (title or topic match) AND by any active filter chips
  // (a category must contain every selected topic tag).
    const categories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCategories.filter((c) => {
      const matchesSearch = !q || c.title.toLowerCase().startsWith(q);
      const matchesTopics =
        activeTopics.length === 0 || activeTopics.every((t) => c.topics.includes(t));
      return matchesSearch && matchesTopics;
    });
  }, [allCategories, searchQuery, activeTopics]);

  const clearAll = () => {
    setSearchQuery("");
    setActiveTopics([]);
  };

  const startPractice = async (key, mode) => {
    try {
      await api.post("/test/set-categories", { categories: [key] });
    } catch (err) {
      console.error("Could not save preferred category (continuing anyway):", err);
    }
    if (user) localStorage.setItem('lastCategorySlug', key);
    navigate(mode === "text" ? `/text/${key}` : `/call/${key}`);
  };

  return (
    <div className="cat-page">
      <div className="cat-shell">
        {/* ── Left sidebar: search + filters ── */}
                <aside className="cat-sidebar cat-anim-in">
          <button className="cat-home-btn" onClick={() => navigate('/')}>← Home</button>

          <div className="cat-sidebar-heading">
            <h2>Find a topic</h2>
            <p>Search or filter categories to practice</p>
          </div>

          <div className="cat-search-box">
            <span className="cat-search-icon">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search e.g. travel, food..."
              className="cat-search-input"
            />
            {searchQuery && (
              <button
                className="cat-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

                       <div className="cat-filters">
            {topicGroups.map((group) => {
              const groupActive = activeTopics.filter((t) => group.topics.includes(t));
              const isOpen = !!openGroups[group.name];
              return (
                <div className="cat-filter-group" key={group.name}>
                  <button className="cat-filter-dropdown-btn" onClick={() => toggleGroup(group.name)}>
                    <span className="cat-filter-dropdown-label">
                      {group.name}
                      {groupActive.length > 0 && (
                        <span className="cat-filter-count-badge">{groupActive.length}</span>
                      )}
                    </span>
                    <span className={`cat-filter-chevron${isOpen ? " cat-filter-chevron-open" : ""}`}>▾</span>
                  </button>

                                   {isOpen && (
                    <div className="cat-filter-dropdown-panel cat-panel-slide">
                      <div className="cat-filters-chips">
                                                {group.topics.map((topic, ti) => (
                          <button
                            key={topic}
                            className={`cat-filter-chip cat-anim-in${activeTopics.includes(topic) ? " cat-filter-chip-active" : ""}`}
                            style={{ animationDelay: `${ti * 0.03}s` }}
                            onClick={() => toggleTopic(topic)}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                      {groupActive.length > 0 && (
                        <button
                          className="cat-filters-reset"
                          onClick={() => setActiveTopics((prev) => prev.filter((t) => !group.topics.includes(t)))}
                        >
                          Reset {group.name}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {activeTopics.length > 0 && (
              <button className="cat-filters-reset-all" onClick={() => setActiveTopics([])}>
                Clear all filters
              </button>
            )}
          </div>

          <p className="cat-sidebar-count">
            {categories.length} of {allCategories.length} topics
          </p>
        </aside>

                       {/* ── Main content ── */}
        <div className="cat-main">
          <div className="cat-welcome-banner cat-anim-in">
            <div className="cat-welcome-top">
              <div className="cat-welcome-avatar">
                <img src={defaultAvatarFor(user)} alt="" />
              </div>
              <div>
                <h1 className="cat-h1">Hey {user?.username} <span className="cat-wave">👋</span></h1>
                <p className="cat-subtitle">
                  Your level: <strong className="cat-level-highlight">{LEVEL_LABELS[level] || level.toUpperCase()}</strong> — pick a topic below.
                </p>
              </div>
            </div>

            <div className="cat-stats-row">
              <div className="cat-stat-card cat-anim-in" style={{ animationDelay: "0.08s" }}>
                <span className="cat-stat-icon cat-flame-pulse">🔥</span>
                <div>
                  <div className="cat-stat-num">{useCountUp(stats?.streakDays ?? 0)}</div>
                  <div className="cat-stat-label">Day streak</div>
                </div>
              </div>
              <div className="cat-stat-card cat-anim-in" style={{ animationDelay: "0.16s" }}>
                <span className="cat-stat-icon">✅</span>
                <div>
                  <div className="cat-stat-num">{useCountUp(stats?.lessonsCompleted ?? 0)}</div>
                  <div className="cat-stat-label">Lessons done</div>
                </div>
              </div>
              <div className="cat-stat-card cat-anim-in" style={{ animationDelay: "0.24s" }}>
                <span className="cat-stat-icon">🎯</span>
                <div>
                  <div className="cat-stat-num">{useCountUp(stats?.weeklyGoal?.completed ?? 0)}/{stats?.weeklyGoal?.target ?? 5}</div>
                  <div className="cat-stat-label">This week</div>
                </div>
              </div>
            </div>

            {lastCategory && (
              <button className="cat-continue-btn" onClick={() => startPractice(lastCategory.key, "call")}>
                <span>▶</span> Continue: {lastCategory.title}
              </button>
            )}
          </div>

          {categories.length === 0 ? (
                       <div className="cat-empty-state cat-anim-in">
              <span className="cat-empty-icon cat-empty-bounce">🔍</span>
              <p>No topics match your search / filters</p>
              <button className="cat-mode-btn" onClick={clearAll}>
                Clear search & filters
              </button>
            </div>
          ) : (
            <div className="cat-grid">
                           {categories.map((c, i) => (
                <div key={c.key} className="cat-card cat-anim-in" style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                  <div className="cat-card-image">
                    <img
                      src={reliableImage(c.image, c.key)}
                      alt={c.title}
                      loading="lazy"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/600x400/0e1f19/10b981?text=${encodeURIComponent(c.title)}`;
                      }}
                    />
                    <span className="cat-card-icon-badge">{c.icon}</span>
                  </div>
                  <div className="cat-card-body">
                    <h3 className="cat-card-title">{c.title}</h3>
                    <div className="cat-card-topics">
                      {c.topics.map((t, i) => (
                        <span className="cat-topic-chip" key={i}>{t}</span>
                      ))}
                    </div>
                    {showTextOption ? (
                      <div className="cat-modes-row">
                        <button className="cat-mode-btn" onClick={() => startPractice(c.key, "text")}>
                          ⌨️ Type
                        </button>
                        <button className="cat-mode-btn cat-mode-btn-primary" onClick={() => startPractice(c.key, "call")}>
                          🎤 Speak
                        </button>
                      </div>
                    ) : (
                      <button className="cat-mode-btn-full" onClick={() => startPractice(c.key, "call")}>
                        🎤 Start Learning
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cat-page {
          position: fixed; inset: 0; overflow-y: auto; z-index: 1;
          width: 100vw; min-height: 100vh; box-sizing: border-box;
          font-family: 'Inter', system-ui, sans-serif;
          background: linear-gradient(135deg, #050a08, #0e1f19, #070d0a);
          color: #ffffff;
        }
        .cat-shell {
          display: flex;
          align-items: flex-start;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          gap: 32px;
          padding: 32px 40px 80px;
          box-sizing: border-box;
        }

        /* ── Sidebar ── */
        .cat-sidebar {
          flex: 0 0 260px;
          position: sticky;
          top: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cat-home-btn {
          align-self: flex-start;
          padding: 9px 16px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff; font-weight: 600; font-size: 14px;
          cursor: pointer; transition: all 0.25s; font-family: inherit;
        }
        .cat-home-btn:hover { border-color: #10b981; background: rgba(16,185,129,0.1); }

        .cat-sidebar-heading h2 {
          font-size: 18px; font-weight: 800; margin: 0 0 4px;
        }
        .cat-sidebar-heading p {
          font-size: 13px; color: rgba(255,255,255,0.5); margin: 0;
        }

        .cat-search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 0 12px;
          transition: border-color 0.25s;
        }
        .cat-search-box:focus-within {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
        }
        .cat-search-icon { font-size: 14px; opacity: 0.6; margin-right: 8px; }
        .cat-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          padding: 11px 0;
        }
        .cat-search-input::placeholder { color: rgba(255,255,255,0.35); }
        .cat-search-clear {
          background: none; border: none; color: rgba(255,255,255,0.5);
          cursor: pointer; font-size: 13px; padding: 4px;
        }
        .cat-search-clear:hover { color: #fff; }

        /* ── Filters ── */
        .cat-filters {
          display: flex; flex-direction: column; gap: 10px;
          padding-top: 4px;
        }
        .cat-filters-heading {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.04em; color: rgba(255,255,255,0.45);
        }
        .cat-filters-reset {
          background: none; border: none; cursor: pointer;
          font-size: 12px; font-weight: 600; color: #10b981;
          text-transform: none; letter-spacing: normal;
        }
        .cat-filters-reset:hover { color: #34d399; }
        .cat-filters-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .cat-filter-chip {
          font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 999px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.75); cursor: pointer; transition: all 0.2s;
          font-family: inherit;
        }
        .cat-filter-chip:hover { border-color: rgba(16,185,129,0.4); color: #fff; }
        .cat-filter-chip-active {
          background: rgba(16,185,129,0.18); border-color: #10b981; color: #d4af37;
        }

        .cat-sidebar-count {
          font-size: 12.5px; color: rgba(255,255,255,0.4); margin: 0;
        }
                      .cat-filter-group {
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 12px;
        }
        .cat-filter-group:last-child { border-bottom: none; padding-bottom: 0; }

        .cat-filter-dropdown-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 14px;
          cursor: pointer;
          font-family: inherit;
          color: #fff;
          transition: all 0.2s;
        }
        .cat-filter-dropdown-btn:hover { border-color: rgba(16,185,129,0.4); }
        .cat-filter-dropdown-label {
          font-size: 12.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.04em; color: rgba(255,255,255,0.75);
          display: flex; align-items: center; gap: 8px;
        }
        .cat-filter-count-badge {
          background: #10b981; color: #052014; font-size: 11px; font-weight: 800;
          border-radius: 999px; padding: 1px 7px; text-transform: none; letter-spacing: normal;
        }
        .cat-filter-chevron {
          font-size: 13px; color: rgba(255,255,255,0.5); transition: transform 0.2s;
        }
        .cat-filter-chevron-open { transform: rotate(180deg); color: #10b981; }

        .cat-filter-dropdown-panel {
          margin-top: 10px;
          padding: 4px 2px 2px;
          display: flex; flex-direction: column; gap: 10px;
        }

        .cat-filters-reset-all {
          align-self: flex-start; background: none; border: none; cursor: pointer;
          font-size: 12.5px; font-weight: 700; color: #f0d98a; padding: 4px 0;
        }
        .cat-filters-reset-all:hover { color: #d4af37; }

        /* ── Main content ── */
        .cat-main { flex: 1; min-width: 0; }
        .cat-h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
                @keyframes catFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cat-anim-in {
          animation: catFadeUp 0.5s ease both;
        }

        @keyframes catWave {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(18deg); }
          30% { transform: rotate(-8deg); }
          45% { transform: rotate(18deg); }
          60% { transform: rotate(-4deg); }
        }
        .cat-wave {
          display: inline-block;
          transform-origin: 70% 70%;
          animation: catWave 2.2s ease-in-out infinite;
        }

        @keyframes catFlamePulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(239,68,68,0)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 6px rgba(239,68,68,0.6)); }
        }
        .cat-flame-pulse {
          display: inline-block;
          animation: catFlamePulse 1.8s ease-in-out infinite;
        }

        .cat-stat-card {
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .cat-stat-card:hover {
          transform: translateY(-3px);
          border-color: rgba(16,185,129,0.35);
          box-shadow: 0 8px 20px rgba(16,185,129,0.15);
        }

        .cat-card::before {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 60%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.08), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
          pointer-events: none;
          z-index: 3;
        }
                .cat-card:hover::before { left: 150%; }
        .cat-card { position: relative; overflow: hidden; }

        /* ── Sidebar & panels ── */
        .cat-panel-slide {
          animation: catSlideDown 0.3s ease both;
          transform-origin: top;
        }
        @keyframes catSlideDown {
          from { opacity: 0; transform: scaleY(0.85) translateY(-6px); }
          to { opacity: 1; transform: scaleY(1) translateY(0); }
        }

        /* ── Search box ── */
        .cat-search-box { transition: border-color 0.25s, box-shadow 0.3s, transform 0.2s; }
        .cat-search-box:focus-within { transform: translateY(-1px); }
        .cat-search-icon { transition: transform 0.3s; }
        .cat-search-box:focus-within .cat-search-icon { transform: scale(1.15) rotate(-8deg); }
        .cat-search-clear { transition: transform 0.2s, color 0.2s; }
        .cat-search-clear:hover { transform: rotate(90deg); }

        /* ── Home button ── */
        .cat-home-btn:hover { transform: translateX(-3px); }

        /* ── Filter dropdown ── */
        .cat-filter-dropdown-btn:active { transform: scale(0.98); }
        .cat-filter-count-badge {
          animation: catBadgePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes catBadgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        /* ── Filter chips ── */
        .cat-filter-chip:hover { transform: translateY(-2px) scale(1.04); }
        .cat-filter-chip:active { transform: scale(0.95); }
        .cat-filter-chip-active { animation: catChipSelect 0.3s ease; }
        @keyframes catChipSelect {
          0% { transform: scale(1); }
          40% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }

        .cat-filters-reset, .cat-filters-reset-all { transition: transform 0.2s; }
        .cat-filters-reset:hover, .cat-filters-reset-all:hover { transform: translateX(2px); }

        /* ── Level highlight shimmer ── */
        .cat-level-highlight {
          background-size: 200% auto;
          animation: catShimmer 3s linear infinite;
        }
        @keyframes catShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* ── Continue button ── */
        .cat-continue-btn { position: relative; overflow: hidden; }
        .cat-continue-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 10px 26px rgba(16,185,129,0.4); }
        .cat-continue-btn:active { transform: scale(0.97); }
        .cat-continue-btn span { display: inline-block; animation: catPlayBounce 1.4s ease-in-out infinite; }
        @keyframes catPlayBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }

        /* ── Empty state ── */
        .cat-empty-bounce { display: inline-block; animation: catEmptyFloat 2s ease-in-out infinite; }
        @keyframes catEmptyFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-8deg); }
        }
        .cat-empty-state .cat-mode-btn:hover { transform: scale(1.05); background: rgba(16,185,129,0.12); }

        /* ── Category card polish ── */
        .cat-card-icon-badge { transition: transform 0.3s; }
        .cat-card:hover .cat-card-icon-badge { transform: scale(1.25) rotate(-6deg); }
        .cat-topic-chip { transition: transform 0.2s; }
        .cat-card:hover .cat-topic-chip { animation: catChipWiggle 0.4s ease; }
        @keyframes catChipWiggle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .cat-card-title { transition: color 0.25s; }
        .cat-card:hover .cat-card-title { color: #6ee7b7; }

        /* ── Welcome avatar breathing ring ── */
        .cat-welcome-avatar { animation: catAvatarGlow 2.6s ease-in-out infinite; }
        @keyframes catAvatarGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }

                .cat-welcome-banner {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          padding: 24px 26px;
          margin-bottom: 32px;
        }
        .cat-welcome-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .cat-welcome-avatar {
          width: 56px; height: 56px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
          border: 2px solid rgba(16,185,129,0.4);
        }
        .cat-welcome-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .cat-welcome-top .cat-h1 { margin-bottom: 4px; }
        .cat-welcome-top .cat-subtitle { margin: 0; max-width: none; }

        .cat-stats-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
        .cat-stat-card {
          flex: 1; min-width: 130px;
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 12px 14px;
        }
        .cat-stat-icon { font-size: 22px; }
        .cat-stat-num { font-size: 18px; font-weight: 800; color: #fff; line-height: 1.1; }
        .cat-stat-label { font-size: 11.5px; color: rgba(255,255,255,0.5); }

        .cat-continue-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none; border-radius: 12px; padding: 11px 18px;
          color: #fff; font-weight: 700; font-size: 13.5px; cursor: pointer;
          box-shadow: 0 6px 18px rgba(16,185,129,0.28);
        }
        .cat-continue-btn:hover { transform: translateY(-2px); }
        .cat-subtitle {
          color: rgba(255,255,255,0.62); font-size: 15px; margin: 0 0 40px;
          max-width: 620px; line-height: 1.6;
        }
        .cat-level-highlight {
          background: linear-gradient(135deg, #10b981, #d4af37);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .cat-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .cat-empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          padding: 80px 20px; text-align: center;
          color: rgba(255,255,255,0.55);
        }
        .cat-empty-icon { font-size: 34px; opacity: 0.6; }

        .cat-card {
          border-radius: 20px; overflow: hidden;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(18px);
          transition: all 0.3s;
        }
        .cat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }
        .cat-card-image { position: relative; width: 100%; height: 140px; overflow: hidden; }
        .cat-card-image img {
          width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;
        }
        .cat-card:hover .cat-card-image img { transform: scale(1.08); }
        .cat-card-image::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(5,10,8,0.85) 100%);
        }
        .cat-card-icon-badge {
          position: absolute; bottom: 10px; left: 14px; z-index: 2;
          font-size: 26px;
        }
        .cat-card-body { padding: 18px 20px 22px; }
        .cat-card-title { font-weight: 700; font-size: 17px; color: #fff; margin-bottom: 10px; }
        .cat-card-topics { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .cat-topic-chip {
          font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25);
          color: #f0d98a;
        }
        .cat-modes-row { display: flex; gap: 8px; }
        .cat-mode-btn {
          flex: 1; padding: 10px 8px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .cat-mode-btn:hover { background: rgba(255,255,255,0.1); }
        .cat-mode-btn-primary {
          border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 6px 18px rgba(16,185,129,0.28);
        }
        .cat-mode-btn-primary:hover { transform: translateY(-2px); }
        .cat-mode-btn-full {
          width: 100%; padding: 11px 8px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; font-size: 13.5px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 6px 18px rgba(16,185,129,0.28);
          transition: all 0.2s;
        }
        .cat-mode-btn-full:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16,185,129,0.4); }

        @media (max-width: 900px) {
          .cat-shell { flex-direction: column; padding: 24px 16px 60px; }
          .cat-sidebar { position: static; flex: none; width: 100%; }
        }
        @media (max-width: 600px) {
          .cat-h1 { font-size: 26px; }
          .cat-page { padding-bottom: 76px; }
        }
      `}</style>

      <BottomNav />
    </div>
  );
}