// This is the Single Source of Truth for Web, APK, and Database Validation
const JOB_FILTERS = {
    // From FilterOptions.js & postJobOptions.js
    sectors: [
        "IT Services & Consulting",
        "Software Development",
        "Manufacturing",
        "Healthcare & Pharmaceuticals",
        "Education & Training",
        "Finance & Banking",
        "Retail & E-commerce",
        "Construction & Real Estate",
        "Hospitality & Tourism",
        "Telecommunications",
        "Automotive",
        "Agriculture",
        "Media & Entertainment",
        "Logistics & Transportation",
        "Other"
    ],

    govJobCategories: ["Central Government", "State Government"],

    specializations: [
        "Computer Science",
        "Information Technology",
        "Mechanical",
        "Civil",
        "Electrical",
        "Electronics",
        "Commerce",
        "Science",
        "Arts",
        "Business Administration",
        "Others"
    ],

    skillOptions: [
        "React.js",
        "Node.js",
        "Python",
        "Java",
        "C++",
        "JavaScript",
        "HTML/CSS",
        "SQL",
        "Project Management",
        "Sales",
        "Marketing"
    ],

    courseTypeOptions: [
        "Full-time",
        "Part-time",
        "Distance",
        "Online"
    ],

    jobTypes: [
        "Full Time",
        "Part Time",
        "Specific Time",
        "Freelance",
        "Contract Based",
        "Internship"
    ],

    workModes: [
        "Regular",
        "Work from home",
        "Hybrid",
        "Field Work"
    ],

    educationLevels: [
        "10th Pass (SSLC)",
        "12th Pass (HSC)",
        "ITI / Vocational",
        "Diploma",
        "Under Graduate",
        "Post Graduate",
        "Doctorate (Ph.D)",
        "Any Degree"
    ],

    experienceLevels: [
        "Fresher",
        "0-1 Year",
        "1-2 years",
        "1-3 Years",
        "2-3 years",
        "3-5 years",
        "5-7 years",
        "5+ Years",
        "7-10 years",
        "10+ years"
    ],

    salaryTypes: [
        "Monthly",
        "Yearly (LPA)",
        "Daily",
        "Hourly"
    ],

    benefitOptions: [
        "PF / ESI",
        "Free food",
        "Accommodation",
        "Transport facility",
        "Bonus",
        "Insurance",
        "Uniform provided",
        "Paid leave"
    ],

    noticePeriodOptions: [
        "Immediate",
        "Within 7 days",
        "Within 30 days",
        "Flexible"
    ],

    genderOptions: ["Male", "Female", "Transgender", "Any"],

    jobSearchStatusOptions: [
        "Actively Looking",
        "Open to Opportunities",
        "Not Looking (Hired)",
        "Not Looking",
        "Serving Notice",
        "Immediate Joiner"
    ],

    // From StateDistrictData.js
    locations: {
        "Tamil Nadu": [
            "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
            "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
            "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
            "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
            "Ramanathapuram", "Ranipet", "Salem", "Sivagangai", "Tenkasi",
            "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
            "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
            "Vellore", "Viluppuram", "Virudhunagar"
        ],
        "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
        "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR District (Nellore)"],
        "Karnataka": ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belagavi", "Bellary", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura"],
        "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhoopalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri"],
        "Puducherry": [
            "Karaikal",
            "Mahe",
            "Puducherry",
            "Yanam"],
        "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
        "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Banaskantha", "Bharuch", "Bhavnagar", "Dahod", "Dang", "Gandhinagar", "Jamnagar", "Junagadh", "Kutch", "Kheda", "Mehsana", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
        "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],

        "Uttar Pradesh": [
            "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad (Ayodhya)", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Lakhimpur Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"
        ],
        "Bihar": [
            "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
        ],
        "West Bengal": [
            "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
        ],
        "Odisha": [
            "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundergarh"
        ],
        "Rajasthan": [
            "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Ganganagar", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk", "Udaipur"
        ],
        "Haryana": [
            "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat (Nuh)", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
        ],
        "Punjab": [
            "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Tarn Taran"
        ],
        "Madhya Pradesh": [
            "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"
        ],
        "Chhattisgarh": [
            "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kondagaon", "Korba", "Korea", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"
        ],
        "Assam": [
            "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia", "Udalguri"
        ],
        "Jharkhand": [
            "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"
        ],
        "Goa": ["North Goa", "South Goa"],
        "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
        "Jammu & Kashmir": [
            "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
        ],
        "Ladakh": ["Kargil", "Leh"],
        "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Lower Subansiri", "Upper Subansiri", "Kurung Kumey", "Kra Daadi", "Lower Siang", "West Siang", "East Siang", "Siang", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
        "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
        "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
        "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
        "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
        "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
        "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
        "Andaman & Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
        "Dadra and Nagar Haveli and Daman and Diu": ["Dadra & Nagar Haveli", "Daman", "Diu"],
        "Chandigarh": ["Chandigarh"],
        "Lakshadweep": ["Lakshadweep"],

        // You can add more states from StateDistrictData.js here
    },

    // All Colleges and Institutes in India
    colleges: [
        // IITs
        "Indian Institute of Technology Bombay",
        "Indian Institute of Technology Delhi",
        "Indian Institute of Technology Kanpur",
        "Indian Institute of Technology Kharagpur",
        "Indian Institute of Technology Madras",
        "Indian Institute of Technology Roorkee",
        "Indian Institute of Technology Ropar",
        "Indian Institute of Technology Guwahati",
        "Indian Institute of Technology BHU Varanasi",
        "Indian Institute of Technology Hyderabad",
        "Indian Institute of Technology Indore",
        "Indian Institute of Technology Jodhpur",
        "Indian Institute of Technology Patna",
        "Indian Institute of Technology Palakkad",
        "Indian Institute of Technology Tirupati",
        "Indian Institute of Technology Mandi",
        "Indian Institute of Technology ISM Dhanbad",
        "Indian Institute of Technology Bhubaneswar",
        "Indian Institute of Technology Varanasi",
        "Indian Institute of Technology Jammu",
        "Indian Institute of Technology Dharwad",
        "Indian Institute of Technology Bhilai",
        
        // NITs
        "National Institute of Technology Agartala",
        "National Institute of Technology Allahabad",
        "National Institute of Technology Arunachal Pradesh",
        "National Institute of Technology Ashok Nagar",
        "National Institute of Technology Bhopal",
        "National Institute of Technology Calicut",
        "National Institute of Technology Durgapur",
        "National Institute of Technology Goa",
        "National Institute of Technology Hamirpur",
        "National Institute of Technology Indore",
        "National Institute of Technology Jalandhar",
        "National Institute of Technology Jaipur",
        "National Institute of Technology Jamshedpur",
        "National Institute of Technology Kottayam",
        "National Institute of Technology Manipur",
        "National Institute of Technology Meghalaya",
        "National Institute of Technology Mizoram",
        "National Institute of Technology Nagpur",
        "National Institute of Technology Puducherry",
        "National Institute of Technology Raipur",
        "National Institute of Technology Rourkela",
        "National Institute of Technology Silchar",
        "National Institute of Technology Sikkim",
        "National Institute of Technology Srinagar",
        "National Institute of Technology Surathkal",
        "National Institute of Technology Tirupati",
        "National Institute of Technology Uttarakhand",
        "National Institute of Technology Warangal",
        
        // Central Universities
        "University of Delhi",
        "Jawaharlal Nehru University",
        "University of Hyderabad",
        "Banaras Hindu University",
        "Aligarh Muslim University",
        "University of Calcutta",
        "Bangalore University",
        "University of Mumbai",
        "University of Madras",
        "Cochin University of Science and Technology",
        "University of Kerala",
        "Osmania University",
        "University of Pune",
        "Nalanda University",
        "Central University of South Bihar",
        "Central University of Himachal Pradesh",
        "Central University of Jharkhand",
        "Central University of Gujarat",
        "Central University of Punjab",
        "Central University of Tamil Nadu",
        "Central University of Odisha",
        "Central University of Kashmir",
        
        // BITS Pilani
        "BITS Pilani",
        "BITS Pilani Pilani Campus",
        "BITS Pilani Goa Campus",
        "BITS Pilani Hyderabad Campus",
        "BITS Pilani Dubai Campus",
        
        // VIT University
        "Vellore Institute of Technology",
        "VIT University",
        "VIT Vellore",
        "VIT Chennai",
        "VIT Bangalore",
        "VIT Hyderabad",
        "VIT Pune",
        "VIT Bhopal",
        
        // Manipal Academy of Higher Education
        "Manipal Academy of Higher Education",
        "Manipal Institute of Technology",
        "Manipal University",
        "Manipal Dubai",
        
        // SRM Institute of Science and Technology
        "SRM Institute of Science and Technology",
        "SRM University",
        "SRM University Delhi",
        "SRM University Chennai",
        
        // Amrita Vishwa Vidyapeetham
        "Amrita Vishwa Vidyapeetham",
        "Amrita University",
        "Amrita School of Engineering",
        
        // Christ University
        "Christ University",
        "Christ University Bangalore",
        "Christ University Delhi",
        
        // Symbiosis International University
        "Symbiosis International University",
        "Symbiosis Institute of Technology",
        "Symbiosis Institute of Business Management",
        
        // Lovely Professional University
        "Lovely Professional University",
        "LPU",
        "LPU Phagwara",
        
        // IIM
        "Indian Institute of Management Ahmedabad",
        "IIM Bangalore",
        "IIM Calcutta",
        "IIM Indore",
        "IIM Kozhikode",
        "IIM Lucknow",
        "IIM Udaipur",
        "IIM Raipur",
        "IIM Rohtak",
        "IIM Ranchi",
        "IIM Visakhapatnam",
        "IIM Tiruchirappalli",
        "IIM Kashipur",
        
        // XLRI Jamshedpur
        "Xavier Labour Relations Institute",
        "XLRI Jamshedpur",
        
        // ISB Hyderabad
        "Indian School of Business",
        "ISB Hyderabad",
        
        // Other Premier Private Universities
        "Ashoka University",
        "Flame University",
        "Chandigarh University",
        "Shobhit University",
        "Chitkara University",
        "CT University",
        "Jain University",
        "Reva University",
        "Saveetha Institute of Medical and Technical Sciences",
        "Hindustan Institute of Technology and Science",
        "Sri Satya Sai University",
        "Vignan University",
        "KL University",
        "Anurag University",
        "GITAM University",
        "Kalinga Institute of Industrial Technology",
        "KIIT University",
        "Siksha 'O' Anusandhan",
        
        // Anna University
        "Anna University",
        "College of Engineering Guindy",
        "Madras Institute of Technology",
        
        // Jadavpur University
        "Jadavpur University",
        
        // Calcutta University
        "University of Calcutta",
        
        // Delhi Technological University
        "Delhi Technological University",
        "DTU Delhi",
        
        // Delhi University Colleges
        "Hindu College",
        "Miranda House",
        "Ramjas College",
        "Delhi School of Economics",
        "St. Stephens College",
        "Ramakrishna College of Arts Science and Commerce",
        "Kirori Mal College",
        "Delhi College of Engineering",
        "Hansraj College",
        "Shri Aurobindo College",
        "Gargi College",
        
        // Pune University
        "University of Pune",
        "Fergusson College",
        "Modern College of Arts Science and Commerce",
        "Symbiosis Institute of Technology",
        
        // Mumbai University
        "University of Mumbai",
        "Mumbai University",
        "Elphinstone College",
        "SP Jain Institute of Management and Research",
        "JBIMS Mumbai",
        
        // Bangalore Colleges
        "St. Xavier's College Bangalore",
        "Christ University Bangalore",
        "Presidency College Bangalore",
        "Mount Carmel College",
        "Acharya Institute of Technology",
        "PES University",
        "JSS Academy of Higher Education and Research",
        
        // Tamil Nadu Colleges
        "College of Engineering Madras",
        "CEG Anna University",
        "Loyola College Chennai",
        "Stella Maris College",
        "Lady Doak College",
        "Presidency College Chennai",
        "Madras Christian College",
        "Ethiraj College for Women",
        "Coimbatore Institute of Technology",
        "PSG College of Technology",
        "Anna University",
        "SASTRA University",
        "Kumaraguru College of Technology",
        
        // Kerala Colleges
        "Cochin University of Science and Technology",
        "University of Kerala",
        "St. Thomas College Thrissur",
        "Maharajas College Ernakulam",
        "Trivandrum Medical College",
        "Sree Narayana College",
        "Union Christian College",
        
        // Hyderabad Colleges
        "University of Hyderabad",
        "ICFAI University Hyderabad",
        "Osmania University",
        "JNTU Hyderabad",
        "Anurag University",
        "CMR Institute of Technology",
        "GITAM Hyderabad",
        "Vignan University",
        "Institute of Aeronautical Engineering",
        
        // Kolkata Colleges
        "Calcutta University",
        "Presidency University Kolkata",
        "St. Xavier's College Kolkata",
        "Scottish Church College",
        "Jadavpur University",
        "Bengal Engineering and Science University",
        "Ramakrishna Mission Institute of Culture",
        
        // Medical Colleges
        "All India Institute of Medical Sciences Delhi",
        "AIIMS Delhi",
        "AIIMS Jodhpur",
        "AIIMS Bhopal",
        "AIIMS Patna",
        "AIIMS Rishikesh",
        "AIIMS Raipur",
        "AIIMS Pune",
        "Armed Forces Medical College",
        "AFMC Pune",
        "Christian Medical College Vellore",
        "CMC Vellore",
        "Madras Medical College",
        "Stanley Medical College",
        
        // Agricultural Universities
        "Indian Agricultural Research Institute",
        "IARI Delhi",
        "Punjab Agricultural University",
        "PAU Ludhiana",
        "Tamil Nadu Agricultural University",
        "TNAU Coimbatore",
        "Anand Agricultural University",
        "Gujarat Agricultural University",
        "Rajasthan Agriculture University",
        "University of Agricultural Sciences Bangalore",
        
        // Law Universities
        "National Law School of India University",
        "NLSIU Bangalore",
        "National Law University Delhi",
        "Gujarat National Law University",
        "Tamil Nadu Dr. Ambedkar Law University",
        "National Law University Odisha",
        "West Bengal National University of Juridical Sciences",
        "Symbiosis Law School",
        "Gujarat Law University",
        
        // Other Notable Colleges
        "Sri Sathya Sai University",
        "ICFAI University",
        "Institute of Aeronautical Engineering",
        "VNR Vignana Jyothi Institute of Engineering and Technology",
        "Institute of Technology and Management Ghaziabad",
        "Galgotias University",
        "O P Jindal Global University",
        "Shiv Nadar University",
        "Mahindra University",
        "IISER Pune",
        "IISER Bhopal",
        "IISER Tirupati",
        "IISER Kolkata",
        "Institute of Forest Management Bhopal",
        "National Institute of Design Ahmedabad",
        "National Institute of Fashion Technology Delhi",
        "National Institute of Technology and Management Ghaziabad",
        "Institute of Chemistry India",
        "Zakir Husain Delhi College",
        "Ramakrishna Mission Vidyamandira",
        "Miranda House Delhi",
        "Ramakrishna Mission Institute of Culture",
        "St. Stephens College Delhi",
        "Hansraj College Delhi",
        "Kirori Mal College Delhi",
        "Delhi College of Arts and Commerce",
        "Maitreyi College Delhi",
        "Rajdhani College Delhi",
        "Rajendra Prasad Institute of Advanced Studies",
        "Sri Guru Nanak Dev University",
        "Punjabi University",
        "Guru Nanak Dev University",
        "MVN University",
        "IP University Delhi",
        "IndiraGandhi Delhi Technical University for Women",
        "Maharishi Markandeshwar University",
        "RIMT University",
        "University of Petroleum and Energy Studies",
        "O P Jindal University",
        "National Institute of Pharmaceutical Education and Research",
        "NIPER Mohali",
        "NIPER Hyderabad",
        "Institute of Plasma Research",
        "Tata Institute of Fundamental Research",
        "TIFR Mumbai",
        "Indian Institute of Science Bangalore",
        "IISc Bangalore",
        "Indian Institute of Science Education and Research",
        "IISER Pune",
        "Weizmann Institute of Science India"
    ]
};

module.exports = { JOB_FILTERS };