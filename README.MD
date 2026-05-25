# 📟 מערכת מוקדן למשטרה ומד"א

מערכת מוקדן מתקדמת לשרתי FiveM עם תמיכה מלאה במשטרה ומד"א.

## 🚔 תכונות עיקריות

### 📋 רשימת שוטרים/פראמדיקים
- הצגת כל השוטרים והפראמדיקים הפעילים
- חלוקה לפי ערוצי רדיו
- סימון שחקנים שמדברים
- הצגת דרגה ותג אישי
- עדכון מיידי לשינויים

### 🎛️ פאנל ניהול מוקדן
- הגדרת תג אישי לכל שחקן
- שליטה בתצוגת הרשימה
- התאמת גודל פונט
- התאמת שקיפות
- פתיחה/סגירה עם מקשים

### 📡 אינטגרציות
- **pma-voice** - תמיכה מלאה בערוצי רדיו
- **ESX** - תמיכה במערכת העבודות
- **oxmysql** - שמירת נתונים

## 🔧 התקנה

### שלב 1: הוספת העמודות ל-Database (ידוע כ RUNTHIS.SQL)
```sql
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `pd_tag` VARCHAR(50) DEFAULT 'אין-תג',
ADD COLUMN IF NOT EXISTS `ems_tag` VARCHAR(50) DEFAULT 'אין-תג';

UPDATE `users` 
SET `pd_tag` = 'אין-תג'
WHERE `job` = 'police' AND (`pd_tag` IS NULL OR `pd_tag` = '');

UPDATE `users` 
SET `ems_tag` = 'אין-תג'
WHERE `job` = 'ambulance' AND (`ems_tag` IS NULL OR `ems_tag` = '');
```

### שלב 2: הוספת המשאב
1. העלה את התיקייה `lg-dispatch` לתיקיית `resources`
2. הוסף ל-`server.cfg`:
```cfg
ensure lg-dispatch
```

### שלב 3: תלות במשאבים אחרים
יש לוודא שהמשאבים הבאים פועלים:
- `es_extended`
- `pma-voice`
- `oxmysql`

## 🎮 שימוש במערכת

### מקשים
- **`=`** - פתיחת פאנל מוקדן
- **`ESC`** - סגירת פאנל
- **`/plist`** - פקודה לפתיחת הפאנל

### פקודות
- **`/plist`** - פתיחת מערכת המוקדן

### הגדרת תג אישי
1. פתח את הפאנל עם `=` או `/plist`
2. הכנס תג (לדוגמה: "מ-1", "פראמדיק-3")
3. לחץ על "שמור"

## ⚙️ התאמה אישית

### קובץ config.lua
בקובץ `config.lua` ניתן להתאים:

#### צבעי תגים
```lua
Config.TagColors = {
    ["מ"] = {r = 139, g = 0, b = 0},
    ["ירקון"] = {r = 255, g = 0, b = 0},
    -- הוסף תגים נוספים
}

Config.EMSTagColors = {
    ["מער"] = {r = 220, g = 20, b = 60},
    ["פראמדיק"] = {r = 255, g = 69, b = 0},
    -- הוסף תגים נוספים
}
```

#### קטגוריות רדיו
```lua
Config.RadioCategories = {
    [500] = "כלל גופי הביטחון 🚨",
    [1] = "קשר ראשי 👮",
    -- הוסף ערוצים נוספים
}

Config.EMSRadioCategories = {
    [500] = "כלל גופי הביטחון 🚨",
    [10] = "קשר ראשי מד״א 🚑",
    -- הוסף ערוצים נוספים
}
```

## 🎨 עיצוב

### מצבי צבע
- **משטרה** - כחול
- **מד"א** - אדום  

### תצוגה
- רשימה שקופה עם אפשרות שינוי שקיפות
- גרירה של הרשימה על המסך
- כיבוי/הדלקת תצוגת הרשימה
- שינוי גודל פונטים

## 🔧 פתרון בעיות

### תגים לא נשמרים
1. ודא שה-SQL רץ בהצלחה
2. בדוק את הקונסול עבור שגיאות
3. וודא שיש הרשאות כתיבה לטבלת users

### הרשימה לא מתעדכנת
1. בדוק אם pma-voice פועל
2. ודא שהשחקן במשטרה/מד"א
3. בדוק את הקונסול של המשאב

### פאנל לא נפתח
1. ודא שהמקש `=` לא תפוס
2. בדוק אם NUI פועל
3. וודא שהשחקן במשטרה/מד"א

## 📞 תמיכה

### דרישות מערכת
- **FiveM** גרסה עדכנית
- **ESX** 1.2 ומעלה
- **pma-voice** גרסה עדכנית
- **MySQL** 5.7 ומעלה

### קרדיט
**מפתח:** GiborLG  
**גרסה:** 1.0.1  
**עדכון אחרון:** 25/05/2026

## 🚀 ביצועים

המערכת מתוכננת להיות קלה על הביצועים עם:
- עדכונים חכמים (רק כשצריך)
- קריאות SQL יעילות
- תצוגה מותאמת ל-FPS גבוה
- זיכרון מינימלי

---

**📢 הערה:** המערכת נבדקה על ESX עם pma-voice. מומלץ לבדוק התאמה עם מערכות דיבור אחרות.


**✨ תודה שהורדתם את המערכת!**


# 📟 Dispatcher System for Police & EMS

An advanced dispatcher system for FiveM servers with full support for Police and EMS.

## 🚔 Key Features

### 📋 Officer/Paramedic List
- Displays all active officers and paramedics
- Divided by radio channels
- Highlights players who are speaking
- Shows rank and personal badge
- Real-time updates on changes

### 🎛️ Dispatcher Control Panel
- Set a personal badge/tag for each player
- Control list display settings
- Adjust font size
- Adjust transparency
- Open/close with keybinds

### 📡 Integrations
- **pma-voice** – Full radio channel support
- **ESX** – Job system support
- **oxmysql** – Data persistence

---

## 🔧 Installation

### Step 1: Add Columns to the Database (SQL)
```sql
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `pd_tag` VARCHAR(50) DEFAULT 'No-Tag',
ADD COLUMN IF NOT EXISTS `ems_tag` VARCHAR(50) DEFAULT 'No-Tag';

UPDATE `users` 
SET `pd_tag` = 'No-Tag'
WHERE `job` = 'police' AND (`pd_tag` IS NULL OR `pd_tag` = '');

UPDATE `users` 
SET `ems_tag` = 'No-Tag'
WHERE `job` = 'ambulance' AND (`ems_tag` IS NULL OR `ems_tag` = '');
```

### Step 2: Add the Resource
1. Upload the `lg-dispatch` folder to your `resources` directory
2. Add the following to `server.cfg`:
```cfg
ensure lg-dispatch
```

### Step 3: Resource Dependencies
Make sure the following resources are running:
- `es_extended`
- `pma-voice`
- `oxmysql`

---

## 🎮 Usage

### Keybinds
- **`=`** – Open the dispatcher panel
- **`ESC`** – Close the panel
- **`/plist`** – Command to open the panel

### Commands
- **`/plist`** – Open the dispatcher system

### Setting a Personal Tag
1. Open the panel with `=` or `/plist`
2. Enter a tag (e.g. "D-1", "Paramedic-3")
3. Click **Save**

---

## ⚙️ Customization

### config.lua
In `config.lua` you can customize:

#### Tag Colors
```lua
Config.TagColors = {
    ["D"] = {r = 139, g = 0, b = 0},
    ["Patrol"] = {r = 255, g = 0, b = 0},
    -- Add more tags
}

Config.EMSTagColors = {
    ["EMS"] = {r = 220, g = 20, b = 60},
    ["Paramedic"] = {r = 255, g = 69, b = 0},
    -- Add more tags
}
```

#### Radio Categories
```lua
Config.RadioCategories = {
    [500] = "All Security Forces 🚨",
    [1] = "Main Channel 👮",
    -- Add more channels
}

Config.EMSRadioCategories = {
    [500] = "All Security Forces 🚨",
    [10] = "EMS Main Channel 🚑",
    -- Add more channels
}
```

---

## 🎨 Design

### Color Modes
- **Police** – Blue
- **EMS** – Red

### Display Options
- Transparent list with adjustable opacity
- Draggable list on screen
- Toggle list visibility on/off
- Adjustable font sizes

---

## 🔧 Troubleshooting

### Tags Not Saving
1. Confirm the SQL ran successfully
2. Check the console for errors
3. Ensure the `users` table has write permissions

### List Not Updating
1. Check if `pma-voice` is running
2. Confirm the player is in the police or EMS job
3. Check the resource console for errors

### Panel Not Opening
1. Make sure the `=` key isn't bound to something else
2. Check if NUI is functioning
3. Confirm the player is in the police or EMS job

---

## 📞 Support

### System Requirements
- **FiveM** – Latest version
- **ESX** – 1.2 or higher
- **pma-voice** – Latest version
- **MySQL** – 5.7 or higher

### Credits
**Developer:** GiborLG
**Version:** 1.0.1
**Last Updated:** 25/05/2026

---

## 🚀 Performance

The system is designed to be lightweight with:
- Smart updates (only when necessary)
- Efficient SQL queries
- High FPS-optimized rendering
- Minimal memory usage

---

> **📢 Note:** The system has been tested on ESX with pma-voice. It is recommended to verify compatibility with other voice systems.

**✨ Thank you for downloading the system!**
