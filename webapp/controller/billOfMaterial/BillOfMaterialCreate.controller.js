sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../material/MaterialController",
	"./BillOfMaterialController",
	"../MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MaterialController, BillOfMaterialController, MainController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.billOfMaterial.BillOfMaterialCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter;
			
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("billOfMaterialCreateRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBoxes.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			
			this.resetFormFields();
			this.initializeBillOfMaterialModel();
			BillOfMaterialController.initializeBillOfMaterialItemModel(this);
    	},


		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			BillOfMaterialController.createBillOfMaterialByWebService(this.getView().getModel("newBillOfMaterial"), this.saveBillOfMaterialCallback, this);
		},


		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");
		},


		/**
		 * Opens the dialog to add a new bill of material item.
		 */
		onAddItemPressed : function () {
			BillOfMaterialController.setIdOfNewItem(this.getView().getModel("newBillOfMaterial"), this);
			MainController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.billOfMaterial.BillOfMaterialItemCreate");
		},
		
		
		/**
		 * Handles the deletion of an item.
		 */
		onDeleteItemPressed : function () {
			var oSelectedItem, oResourceBundle;
			
			//Check if an item has been selected.
			oSelectedItem = this.getView().byId("itemTable").getSelectedItem();
			if(oSelectedItem == null) {
				oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("billOfMaterialCreate.noItemSelected"));
				return;
			}
			
			BillOfMaterialController.deleteItemFromBomModel(this.getSelectedItem(), this.getView().getModel("newBillOfMaterial"));
			BillOfMaterialController.updateItemIds(this.getView().getModel("newBillOfMaterial"));
			this.updateItemTable();
		},
		
		
		/**
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			BillOfMaterialController.clearItemPopUpFields(this);
			BillOfMaterialController.initializeBillOfMaterialItemModel(this);
		},
		
		
		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newBillOfMaterialItem");
			var oBillOfMaterialModel = this.getView().getModel("newBillOfMaterial");
			var oBillOfMaterialItems = oBillOfMaterialModel.getProperty("/items");
			var itemWithMaterialExists;
			
			//Check if a material has been selected.
			if(this.getView().byId("itemMaterialComboBox").getSelectedItem() == null) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialCreate.noItemMaterialSelected"));
				return;
			}
			
			//Do not allow adding an item with quantity 0.
			if(oItemData.oData.quantity < 1) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialCreate.quantityIsZero"));
				return;
			}
			
			//Check if a bill of material item with the same material already exists.
			itemWithMaterialExists = BillOfMaterialController.isItemWithMaterialExisting(oBillOfMaterialItems, oItemData.oData.materialId);
			if(itemWithMaterialExists == true) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialCreate.itemWithMaterialExists", [oItemData.oData.materialId]));
				return;
			}
			
			//Remove the binding of the UI to the selectedItemMaterial. 
			//Otherwhise the selectedItemMaterial is updated by databinding when the input fields are being cleared.
			this.getView().setModel(null, "selectedItemMaterial");
			
			//Add the item to the bill of material model. Then re-initialize the item model that is bound to the "new item PopUp".
			oBillOfMaterialItems.push(oItemData.oData);
			oBillOfMaterialModel.setProperty("/items", oBillOfMaterialItems);
			BillOfMaterialController.initializeBillOfMaterialItemModel(this);
			
			this.byId("newItemDialog").close();
			BillOfMaterialController.clearItemPopUpFields(this);
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			var oBillOfMaterialModel = this.getView().getModel("newBillOfMaterial");
			var iMaterialId = MainController.getSelectedCBItemKey(oControlEvent);
			
			oBillOfMaterialModel.setData({materialId: iMaterialId}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox of the "new item"-PopUp".
		 */
		onItemMaterialSelectionChange : function (oControlEvent) {
			BillOfMaterialController.onItemMaterialSelectionChange(oControlEvent, this,
				this.getView().getModel("newBillOfMaterialItem"),
				this.getView().getModel("materials"));
		},


		/**
		 * Initializes the model of the bill of material to which the UI controls are bound.
		 */
		initializeBillOfMaterialModel : function () {
			var oBillOfMaterialModel = new JSONModel();
			
			//Load and set order model
			oBillOfMaterialModel.loadData("model/billOfMaterial/billOfMaterialCreate.json");
			this.getView().setModel(oBillOfMaterialModel, "newBillOfMaterial");	
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			return BillOfMaterialController.materialNameFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return BillOfMaterialController.materialUnitFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Resets the form fields to the initial state.
		 */
		resetFormFields : function () {
			this.getView().byId("materialComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Gets the the selected bill of material item.
		 */
		getSelectedItem : function () {
			var oListItem = this.getView().byId("itemTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("newBillOfMaterial");
			var oSelectedItem = oContext.getProperty(null, oContext);
			
			return oSelectedItem;
		},
		
		
		/**
		 * Updates the item table in order to display changes of the underlying model.
		 */
		updateItemTable : function() {
			var oBillOfMaterialModel;
			
			//Assures that the changes of the underlying model are being displayed in the view.
			oBillOfMaterialModel = this.getView().getModel("newBillOfMaterial");
			oBillOfMaterialModel.refresh();						
			
			//Assures that the formatters are called again.
			this.getView().byId("itemTable").rerender();	
		},
		
		
		/**
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iExistingItemCount;
			var oBillOfMaterialModel;
			
			if(this.getView().byId("materialComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("billOfMaterialCreate.noMaterialSelected"));
				return false;
			}
			
			//The bill of material has to have at least one item.
			oBillOfMaterialModel = this.getView().getModel("newBillOfMaterial");
			iExistingItemCount = oBillOfMaterialModel.oData.items.length;
			
			if(iExistingItemCount < 1) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialCreate.noItemsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Callback function of the queryMaterialsByWebService RESTful WebService call in the MaterialController.
		 */
		queryMaterialsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "materials");
		},
		
		
		/**
		 * Callback function of the createBillOfMaterialByWebService RESTful WebService call in theBillOfMaterialController.
		 */
		saveBillOfMaterialCallback : function (oReturnData, callingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					callingController.resetFormFields();
					callingController.initializeBillOfMaterialModel();
					BillOfMaterialController.initializeBillOfMaterialItemModel(callingController);
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			} 
		}
	});
});