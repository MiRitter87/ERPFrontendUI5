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

	return Controller.extend("ERPFrontendUI5.controller.billOfMaterial.BillOfMaterialEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("billOfMaterialEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query bill of material and material data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			BillOfMaterialController.queryBillOfMaterialsByWebService(this.queryBillOfMaterialsCallback, this, true);
			
			this.getView().setModel(null, "selectedBillOfMaterial");
			this.resetUIElements();
		},
		
		
		/**
		 * Handles the selection of an item in the bill of material ComboBox.
		 */
		onBillOfMaterialSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oBillOfMaterialsModel = this.getView().getModel("billOfMaterials");
			var oBillOfMaterial, wsBillOfMaterial;
			
			if(oSelectedItem == null) {
				this.resetUIElements();
				return;
			}
				
			oBillOfMaterial = BillOfMaterialController.getBillOfMaterialById(oSelectedItem.getKey(), oBillOfMaterialsModel.oData.billOfMaterial);
			if(oBillOfMaterial != null)
				wsBillOfMaterial = this.getBillOfMaterialForWebService(oBillOfMaterial);
			
			//Set the model of the view according to the selected bill of material to allow binding of the UI elements.
			this.getView().setModel(wsBillOfMaterial, "selectedBillOfMaterial");
			
			BillOfMaterialController.initializeBillOfMaterialItemModel(this);
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			var oBillOfMaterialModel = this.getView().getModel("selectedBillOfMaterial");
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
		 * Opens the dialog to add a new bill of material item.
		 */
		onAddItemPressed : function () {
			var oResourceBundle;
			
			if(this.byId("billOfMaterialComboBox").getSelectedKey() == "") {
				oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("billOfMaterialEdit.noBillOfMaterialSelected"));
				return;
			}			
			
			BillOfMaterialController.setIdOfNewItem(this.getView().getModel("selectedBillOfMaterial"), this);
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
				MessageBox.error(oResourceBundle.getText("billOfMaterialEdit.noItemSelected"));
				return;
			}
			
			BillOfMaterialController.deleteItemFromBomModel(this.getSelectedItem(), this.getView().getModel("selectedBillOfMaterial"));
			BillOfMaterialController.updateItemIds(this.getView().getModel("selectedBillOfMaterial"));
			this.updateItemTable();
		},
		
		
		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newBillOfMaterialItem");
			var oBillOfMaterialModel = this.getView().getModel("selectedBillOfMaterial");
			var oBillOfMaterialItems = oBillOfMaterialModel.getProperty("/items");
			var itemWithMaterialExists;
			
			//Check if a material has been selected.
			if(this.getView().byId("itemMaterialComboBox").getSelectedItem() == null) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialEdit.noItemMaterialSelected"));
				return;
			}
			
			//Do not allow adding an item with quantity 0.
			if(oItemData.oData.quantity < 1) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialEdit.quantityIsZero"));
				return;
			}
			
			//Check if a bill of material item with the same material already exists.
			itemWithMaterialExists = BillOfMaterialController.isItemWithMaterialExisting(oBillOfMaterialItems, oItemData.oData.materialId);
			if(itemWithMaterialExists == true) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialEdit.itemWithMaterialExists", [oItemData.oData.materialId]));
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
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			BillOfMaterialController.clearItemPopUpFields(this);
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			BillOfMaterialController.saveBillOfMaterialByWebService(this.getView().getModel("selectedBillOfMaterial"), this.saveBillOfMaterialCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");
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
		 * Creates a representation of a bill of material that can be processed by the WebService.
		 */
		getBillOfMaterialForWebService : function(oBillOfMaterial) {
			var wsBillOfMaterial = new JSONModel();
			var wsBillOfMaterialItem;
			
			//Data at head level
			wsBillOfMaterial.setProperty("/billOfMaterialId", oBillOfMaterial.id);
			wsBillOfMaterial.setProperty("/name", oBillOfMaterial.name);
			wsBillOfMaterial.setProperty("/description", oBillOfMaterial.description);
			wsBillOfMaterial.setProperty("/materialId", oBillOfMaterial.material.id);
			
			//Data at item level
			wsBillOfMaterial.setProperty("/items", new Array());
			
			for(var i = 0; i < oBillOfMaterial.items.length; i++) {
				var oTempBillOfMaterialItem = oBillOfMaterial.items[i];
				
				wsBillOfMaterialItem = new JSONModel();
				wsBillOfMaterialItem.setProperty("/itemId", oTempBillOfMaterialItem.id);
				wsBillOfMaterialItem.setProperty("/materialId", oTempBillOfMaterialItem.material.id);
				wsBillOfMaterialItem.setProperty("/quantity", oTempBillOfMaterialItem.quantity);
				
				wsBillOfMaterial.oData.items.push(wsBillOfMaterialItem.oData);
			}
			
			return wsBillOfMaterial;
		},
		
		
		/**
		 * Gets the the selected bill of material item.
		 */
		getSelectedItem : function () {
			var oListItem = this.getView().byId("itemTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("selectedBillOfMaterial");
			var oSelectedItem = oContext.getProperty(null, oContext);
			
			return oSelectedItem;
		},
		
		
		/**
		 * Updates the item table in order to display changes of the underlying model.
		 */
		updateItemTable : function() {
			var oBillOfMaterialModel;
			
			//Assures that the changes of the underlying model are being displayed in the view.
			oBillOfMaterialModel = this.getView().getModel("selectedBillOfMaterial");
			oBillOfMaterialModel.refresh();						
			
			//Assures that the formatters are called again.
			this.getView().byId("itemTable").rerender();	
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("billOfMaterialComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("nameInput").setValue("");
			this.getView().byId("descriptionTextArea").setValue("");
			this.getView().byId("materialComboBox").setSelectedItem(null);
			
			this.getView().byId("itemTable").destroyItems();
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
				MessageBox.error(oResourceBundle.getText("billOfMaterialEdit.noMaterialSelected"));
				return false;
			}
			
			//The bill of material has to have at least one item.
			oBillOfMaterialModel = this.getView().getModel("selectedBillOfMaterial");
			iExistingItemCount = oBillOfMaterialModel.oData.items.length;
			
			if(iExistingItemCount < 1) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialEdit.noItemsExist"));
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
		 * Callback function of the queryBillOfMaterials RESTful WebService call in the BillOfMaterialController.
		 */
		queryBillOfMaterialsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("billOfMaterialEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "billOfMaterials");
		},
		
		
		/**
		 *  Callback function of the saveBillOfMaterial RESTful WebService call in the BillOfMaterialController.
		 */
		saveBillOfMaterialCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new bill of material data.
					BillOfMaterialController.queryBillOfMaterialsByWebService(oCallingController.queryBillOfMaterialsCallback, oCallingController, false);
					
					oCallingController.getView().setModel(null, "selectedBillOfMaterial");
					BillOfMaterialController.initializeBillOfMaterialItemModel(oCallingController);
					oCallingController.resetUIElements();
					
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'I') {
					MessageToast.show(oReturnData.message[0].text);
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