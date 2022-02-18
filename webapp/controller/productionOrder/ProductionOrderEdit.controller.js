sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ProductionOrderController",
	"../material/MaterialController",
	"../MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, ProductionOrderController, MaterialController, MainController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.productionOrder.ProductionOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("productionOrderEditRoute").attachMatched(this._onRouteMatched, this);
			
			ProductionOrderController.initializeStatusComboBox(this.getView().byId("statusComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query Production order and material data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			ProductionOrderController.queryProductionOrdersByWebService(this.queryProductionOrdersCallback, this, true);
			
			this.getView().setModel(null, "selectedProductionOrder");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the production order ComboBox.
		 */
		onProductionOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oProductionOrdersModel = this.getView().getModel("productionOrders");
			var oProductionOrder, wsProductionOrder;
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
				
			oProductionOrder = ProductionOrderController.getProductionOrderById(oSelectedItem.getKey(), oProductionOrdersModel.oData.productionOrder);
			if(oProductionOrder != null)
				wsProductionOrder = this.getProductionOrderForWebService(oProductionOrder);
			
			//Set the model of the view according to the selected production order to allow binding of the UI elements.
			this.getView().setModel(wsProductionOrder, "selectedProductionOrder");
			
			ProductionOrderController.initializeProductionOrderItemModel(this);
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			ProductionOrderController.saveProductionOrderByWebService(this.getView().getModel("selectedProductionOrder"), this.saveProductionOrderCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this), this.getOwnerComponent().getModel("navigation"));
		},
		
		
		/**
		 * Opens the dialog to add a new production order item.
		 */
		onAddItemPressed : function () {
			var oResourceBundle;
			
			if(this.byId("productionOrderComboBox").getSelectedKey() == "") {
				oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("productionOrderEdit.noOrderSelected"));
				return;
			}
			
			ProductionOrderController.setIdOfNewItem(this.getView().getModel("selectedProductionOrder"), this);
			MainController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.productionOrder.ProductionOrderItemCreate");
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
				MessageBox.error(oResourceBundle.getText("productionOrderEdit.noItemSelected"));
				return;
			}
			
			ProductionOrderController.deleteItemFromOrderModel(this.getSelectedItem(), this.getView().getModel("selectedProductionOrder"));
			ProductionOrderController.updateItemIds(this.getView().getModel("selectedProductionOrder"));
			this.updateItemTable();
		},
		
		
		/**
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			this.byId("materialComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newProductionOrderItem");
			var oProductionOrderModel = this.getView().getModel("selectedProductionOrder");
			var oProductionOrderItems = oProductionOrderModel.getProperty("/items");
			var itemWithMaterialExists;
			
			//Check if a material has been selected.
			if(this.getView().byId("materialComboBox").getSelectedItem() == null) {
				MessageBox.error(oResourceBundle.getText("productionOrderEdit.noMaterialSelected"));
				return;
			}
			
			//Do not allow adding an item with quantity 0.
			if(oItemData.oData.quantity < 1) {
				MessageBox.error(oResourceBundle.getText("productionOrderEdit.quantityIsZero"));
				return;
			}
			
			//Check if a production order item with the same material already exists.
			itemWithMaterialExists = ProductionOrderController.isItemWithMaterialExisting(oProductionOrderItems, oItemData.oData.materialId);
			if(itemWithMaterialExists == true) {
				MessageBox.error(oResourceBundle.getText("productionOrderEdit.itemWithMaterialExists", [oItemData.oData.materialId]));
				return;
			}
			
			//Remove the binding of the UI to the selectedMaterial. 
			//Otherwhise the selectedMaterial is updated by databinding when the input fields are being cleared.
			this.getView().setModel(null, "selectedMaterial");
			
			//Add the item to the production order model. Then re-initialize the item model that is bound to the "new item PopUp".
			oProductionOrderItems.push(oItemData.oData);
			oProductionOrderModel.setProperty("/items", oProductionOrderItems);
			ProductionOrderController.initializeProductionOrderItemModel(this);
			
			this.byId("newItemDialog").close();
			ProductionOrderController.clearItemPopUpFields(this);
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			ProductionOrderController.onMaterialSelectionChange(oControlEvent, this,
				this.getView().getModel("newProductionOrderItem"),
				this.getView().getModel("materials"));
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
		 * Callback function of the queryProductionOrders RESTful WebService call in the ProductionOrderController.
		 */
		queryProductionOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				ProductionOrderController.initializeDatesAsObject(oModel.oData.productionOrder);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("productionOrderEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "productionOrders");
		},
		
		
		/**
		 *  Callback function of the saveProductionOrder RESTful WebService call in the ProductionOrderController.
		 */
		saveProductionOrderCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new production order data.
					ProductionOrderController.queryProductionOrdersByWebService(oCallingController.queryProductionOrdersCallback, oCallingController, false);
					
					oCallingController.getView().setModel(null, "selectedProductionOrder");
					ProductionOrderController.initializeProductionOrderItemModel(oCallingController);
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
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			return MaterialController.materialNameFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return MaterialController.materialUnitFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("productionOrderComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("statusComboBox").setSelectedItem(null);
			
			this.getView().byId("orderDatePicker").setDateValue(null);
			this.getView().byId("plannedExecutionDatePicker").setDateValue(null);
			this.getView().byId("executionDatePicker").setDateValue(null);
			
			this.getView().byId("itemTable").destroyItems();
		},
		
		
		/**
		 * Creates a representation of a production order that can be processed by the WebService.
		 */
		getProductionOrderForWebService : function(oProductionOrder) {
			var wsProductionOrder = new JSONModel();
			var wsProductionOrderItem;
			
			//Data at head level
			wsProductionOrder.setProperty("/productionOrderId", oProductionOrder.id);
			wsProductionOrder.setProperty("/orderDate", oProductionOrder.orderDate);
			wsProductionOrder.setProperty("/plannedExecutionDate", oProductionOrder.plannedExecutionDate);
			wsProductionOrder.setProperty("/executionDate", oProductionOrder.executionDate);
			wsProductionOrder.setProperty("/status", oProductionOrder.status);
			
			//Data at item level
			wsProductionOrder.setProperty("/items", new Array());
			
			for(var i = 0; i < oProductionOrder.items.length; i++) {
				var oTempProductionOrderItem = oProductionOrder.items[i];
				
				wsProductionOrderItem = new JSONModel();
				wsProductionOrderItem.setProperty("/itemId", oTempProductionOrderItem.id);
				wsProductionOrderItem.setProperty("/materialId", oTempProductionOrderItem.material.id);
				wsProductionOrderItem.setProperty("/quantity", oTempProductionOrderItem.quantity);
				
				wsProductionOrder.oData.items.push(wsProductionOrderItem.oData);
			}
			
			return wsProductionOrder;
		},
		
		
		/**
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iExistingItemCount;
			var oProductionOrderModel;
			
			if(this.getView().byId("statusComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("productionOrderEdit.noStatusSelected"));
				return false;
			}
			
			if(this.getView().byId("plannedExecutionDatePicker").isValidValue() == false || 
				this.getView().byId("plannedExecutionDatePicker").getValue() == "") {
					
				MessageBox.error(oResourceBundle.getText("productionOrderEdit.noPlannedDateSelected"));
				return false;
			}
			
			//The order has to have at least one item.
			oProductionOrderModel = this.getView().getModel("selectedProductionOrder");
			iExistingItemCount = oProductionOrderModel.oData.items.length;
			
			if(iExistingItemCount < 1) {
				MessageBox.error(oResourceBundle.getText("productionOrderEdit.noItemsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Gets the the selected production order item.
		 */
		getSelectedItem : function () {
			var oListItem = this.getView().byId("itemTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("selectedProductionOrder");
			var oSelectedItem = oContext.getProperty(null, oContext);
			
			return oSelectedItem;
		},
		
		
		/**
		 * Updates the item table in order to display changes of the underlying model.
		 */
		updateItemTable : function() {
			var oProductionOrderModel;
			
			//Assures that the changes of the underlying model are being displayed in the view.
			oProductionOrderModel = this.getView().getModel("selectedProductionOrder");
			oProductionOrderModel.refresh();						
			
			//Assures that the formatters are called again.
			this.getView().byId("itemTable").rerender();	
		}
	});
});