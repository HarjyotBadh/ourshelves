# How to Create a New Item

This README provides step-by-step instructions on how to create a new item in the project.

## 1. Add Item to Firestore

1. Go to the `Items` collection in Firestore.
2. Create a new document.
3. Add the following fields to the document:

    - `cost`: The item's cost
    - `imageUri`: Upload an image to Firebase Storage and use its URI
    - `name`: The item's name
    - `shouldLock`: Boolean indicating whether multiple people can interact with the item simultaneously

4. Note the `itemId` of the newly created document.

## 2. Map Item in Project

1. Navigate to `components/items` in the project.
2. Open the `index` file.
3. Follow the existing code for test items and map the `itemId` to the item file (copy the existing code structure).

## 3. Create Item File

1. Create a new file for your item in the `components/items` directory.
2. Each item has its own unique file that handles all of its functionality.
3. Copy the information from `placeholderItem` and replace "placeholder" with your item's name.

## 4. Modify Item Data

1. In your item file, modify the information within the `ItemData` field.
2. This field stores all the information about your object in Firestore.
   Example: `placeholderItem` has `clickCount` that stores how many times users click on the item.

## 5. Item Functions

### onDataUpdate

-   Call this function whenever you want to update the data in Firestore.
-   Example: When selecting a color for the placeholder item, call `onDataUpdate` to save the color.

### isActive

-   When `isActive` is true, it means the item has been clicked.
-   Use this to conditionally render an item.
-   Example: If you want to open a dialog when an item is clicked, check if `isActive` is true and then render the dialog over the item.

### onClose

-   Use this function when a user finishes interacting with an item.

### roomData

-   Contains information regarding a room for you to use that is passed into your item.
