# BANNER POSITIONS REFERENCE - EXTRA BANNER MANAGEMENT

This document provides a complete list of all banner categories, their slot counts, and position numbers for backend integration.

---

## 📋 BANNER CATEGORIES & POSITIONS

### 1. **EXTRA BANNERS**
- **Category Code:** `extra`
- **Display Name:** Extra Banners
- **Total Slots:** 9
- **Position Range:** 1 - 9
- **Individual Positions:**
  - Position 1 (Slot 1)
  - Position 2 (Slot 2)
  - Position 3 (Slot 3)
  - Position 4 (Slot 4)
  - Position 5 (Slot 5)
  - Position 6 (Slot 6)
  - Position 7 (Slot 7)
  - Position 8 (Slot 8)
  - Position 9 (Slot 9)

---

### 2. **KHOSLA ELECTRONICS BEST SELLERS**
- **Category Code:** `bestsellers`
- **Display Name:** Khosla Electronics Best Sellers
- **Total Slots:** 5
- **Position Range:** 10 - 14
- **Individual Positions:**
  - Position 10 (Slot 1)
  - Position 11 (Slot 2)
  - Position 12 (Slot 3)
  - Position 13 (Slot 4)
  - Position 14 (Slot 5)

---

### 3. **ENTERTAINMENT**
- **Category Code:** `entertainment`
- **Display Name:** ENTERTAINMENT
- **Total Slots:** 4
- **Position Range:** 15 - 18
- **Individual Positions:**
  - Position 15 (Slot 1)
  - Position 16 (Slot 2)
  - Position 17 (Slot 3)
  - Position 18 (Slot 4)

---

### 4. **APPLIANCES**
- **Category Code:** `appliances`
- **Display Name:** APPLIANCES
- **Total Slots:** 4
- **Position Range:** 19 - 22
- **Individual Positions:**
  - Position 19 (Slot 1)
  - Position 20 (Slot 2)
  - Position 21 (Slot 3)
  - Position 22 (Slot 4)

---

### 5. **DIGITAL PRODUCTS**
- **Category Code:** `digitalproducts`
- **Display Name:** DIGITAL PRODUCTS
- **Total Slots:** 4
- **Position Range:** 23 - 26
- **Individual Positions:**
  - Position 23 (Slot 1)
  - Position 24 (Slot 2)
  - Position 25 (Slot 3)
  - Position 26 (Slot 4)

---

### 6. **KITCHEN APPLIANCES**
- **Category Code:** `kitchenappliances`
- **Display Name:** KITCHEN APPLIANCES
- **Total Slots:** 8
- **Position Range:** 27 - 34
- **Individual Positions:**
  - Position 27 (Slot 1)
  - Position 28 (Slot 2)
  - Position 29 (Slot 3)
  - Position 30 (Slot 4)
  - Position 31 (Slot 5)
  - Position 32 (Slot 6)
  - Position 33 (Slot 7)
  - Position 34 (Slot 8)

---

### 7. **LIFESTYLE PRODUCTS**
- **Category Code:** `lifestyleproducts`
- **Display Name:** LIFESTYLE PRODUCTS
- **Total Slots:** 4
- **Position Range:** 35 - 38
- **Individual Positions:**
  - Position 35 (Slot 1)
  - Position 36 (Slot 2)
  - Position 37 (Slot 3)
  - Position 38 (Slot 4)

---

### 8. **POPULAR BRANDS**
- **Category Code:** `popularbrands`
- **Display Name:** POPULAR BRANDS
- **Total Slots:** 30
- **Position Range:** 39 - 68
- **Individual Positions:**
  - Position 39 (Slot 1)
  - Position 40 (Slot 2)
  - Position 41 (Slot 3)
  - Position 42 (Slot 4)
  - Position 43 (Slot 5)
  - Position 44 (Slot 6)
  - Position 45 (Slot 7)
  - Position 46 (Slot 8)
  - Position 47 (Slot 9)
  - Position 48 (Slot 10)
  - Position 49 (Slot 11)
  - Position 50 (Slot 12)
  - Position 51 (Slot 13)
  - Position 52 (Slot 14)
  - Position 53 (Slot 15)
  - Position 54 (Slot 16)
  - Position 55 (Slot 17)
  - Position 56 (Slot 18)
  - Position 57 (Slot 19)
  - Position 58 (Slot 20)
  - Position 59 (Slot 21)
  - Position 60 (Slot 22)
  - Position 61 (Slot 23)
  - Position 62 (Slot 24)
  - Position 63 (Slot 25)
  - Position 64 (Slot 26)
  - Position 65 (Slot 27)
  - Position 66 (Slot 28)
  - Position 67 (Slot 29)
  - Position 68 (Slot 30)

---

## 📊 SUMMARY TABLE

| Category | Code | Slots | Position Range | Start Position | End Position |
|----------|------|-------|----------------|----------------|--------------|
| Extra Banners | `extra` | 9 | 1-9 | 1 | 9 |
| Best Sellers | `bestsellers` | 5 | 10-14 | 10 | 14 |
| Entertainment | `entertainment` | 4 | 15-18 | 15 | 18 |
| Appliances | `appliances` | 4 | 19-22 | 19 | 22 |
| Digital Products | `digitalproducts` | 4 | 23-26 | 23 | 26 |
| Kitchen Appliances | `kitchenappliances` | 8 | 27-34 | 27 | 34 |
| Lifestyle Products | `lifestyleproducts` | 4 | 35-38 | 35 | 38 |
| Popular Brands | `popularbrands` | 30 | 39-68 | 39 | 68 |
| **TOTAL** | - | **68** | **1-68** | **1** | **68** |

---

## 🔧 BACKEND INTEGRATION NOTES

### Position Calculation Formula:
- **Array Index to Position:** `position = arrayIndex + startPosition`
- **Position to Array Index:** `arrayIndex = position - startPosition`

### Example Calculations:

**Extra Banners (positions 1-9):**
- Array Index 0 → Position 1 (0 + 1 = 1)
- Array Index 8 → Position 9 (8 + 1 = 9)

**Best Sellers (positions 10-14):**
- Array Index 0 → Position 10 (0 + 10 = 10)
- Array Index 4 → Position 14 (4 + 10 = 14)

**Entertainment (positions 15-18):**
- Array Index 0 → Position 15 (0 + 15 = 15)
- Array Index 3 → Position 18 (3 + 15 = 18)

**Appliances (positions 19-22):**
- Array Index 0 → Position 19 (0 + 19 = 19)
- Array Index 3 → Position 22 (3 + 19 = 22)

**Digital Products (positions 23-26):**
- Array Index 0 → Position 23 (0 + 23 = 23)
- Array Index 3 → Position 26 (3 + 23 = 26)

**Kitchen Appliances (positions 27-34):**
- Array Index 0 → Position 27 (0 + 27 = 27)
- Array Index 7 → Position 34 (7 + 27 = 34)

**Lifestyle Products (positions 35-38):**
- Array Index 0 → Position 35 (0 + 35 = 35)
- Array Index 3 → Position 38 (3 + 35 = 38)

**Popular Brands (positions 39-68):**
- Array Index 0 → Position 39 (0 + 39 = 39)
- Array Index 29 → Position 68 (29 + 39 = 68)

---

## 📝 API DATA STRUCTURE

Each banner record should contain:
```json
{
  "position": 1-68,
  "imageurl": "string",
  "description": "string",
  "redirecturl": "string",
  "text": "string"
}
```

### Position Validation:
- Valid positions: **1 to 68** (inclusive)
- Positions **1-9**: Extra Banners
- Positions **10-14**: Best Sellers
- Positions **15-18**: Entertainment
- Positions **19-22**: Appliances
- Positions **23-26**: Digital Products
- Positions **27-34**: Kitchen Appliances
- Positions **35-38**: Lifestyle Products
- Positions **39-68**: Popular Brands

---

## ✅ VALIDATION RULES

1. **Position Range:** Must be between 1 and 68
2. **No Overlaps:** Each position can only have one banner
3. **Category Mapping:** Ensure positions map to correct categories
4. **Array Indexing:** Frontend uses 0-based arrays, backend uses 1-based positions

---

**Document Generated:** For Backend Integration  
**Total Banner Positions:** 68  
**Total Categories:** 8

