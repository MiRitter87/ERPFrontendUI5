sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../material/MaterialController",
	"./ProductionOrderController",
	"../MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MaterialController, ProductionOrderController, MainController, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.productionOrder.ProductionOrderCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("productionOrderCreateRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query material data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBoxes.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			
			this.initializeProductionOrderModel();
			ProductionOrderController.initializeProductionOrderItemModel(this);
    	},


		/**
		 * Opens the dialog to add a new production order item.
		 */
		onAddItemPressed : function () {
			ProductionOrderController.setIdOfNewItem(this.getView().getModel("newProductionOrder"), this);
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
				MessageBox.error(oResourceBundle.getText("productionOrderCreate.noItemSelected"));
				return;
			}
			
			ProductionOrderController.deleteItemFromOrderModel(this.getSelectedItem(), this.getView().getModel("newProductionOrder"));
			ProductionOrderController.updateItemIds(this.getView().getModel("newProductionOrder"));
			this.updateItemTable();
		},
		
		
		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newProductionOrderItem");
			var oProductionOrderModel = this.getView().getModel("newProductionOrder");
			var oProductionOrderItems = oProductionOrderModel.getProperty("/items");
			var itemWithMaterialExists;
			
			//Check if a material has been selected.
			if(this.getView().byId("materialComboBox").getSelectedItem() == null) {
				MessageBox.error(oResourceBundle.getText("productionOrderCreate.noMaterialSelected"));
				return;
			}
			
			//Do not allow adding an item with quantity 0.
			if(oItemData.oData.quantity < 1) {
				MessageBox.error(oResourceBundle.getText("productionOrderCreate.quantityIsZero"));
				return;
			}
			
			//Check if a production order item with the same material already exists.
			itemWithMaterialExists = ProductionOrderController.isItemWithMaterialExisting(oProductionOrderItems, oItemData.oData.materialId);
			if(itemWithMaterialExists == true) {
				MessageBox.error(oResourceBundle.getText("productionOrderCreate.itemWithMaterialExists", [oItemData.oData.materialId]));
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
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			ProductionOrderController.clearItemPopUpFields(this);
			ProductionOrderController.initializeProductionOrderItemModel(this);	
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			ProductionOrderController.createProductionOrderByWebService(this.getView().getModel("newProductionOrder"), this.saveProductionOrderCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this), this.getOwnerComponent().getModel("navigation"));
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
		 * Callback function of the createProductionOrderbyWebService RESTful WebService call in the ProductionOrderController.
		 */
		saveProductionOrderCallback : function (oReturnData, callingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					callingController.initializeProductionOrderModel();
					ProductionOrderController.initializeProductionOrderItemModel(callingController);
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
		 * Initializes the model of the production order to which the UI controls are bound.
		 */
		initializeProductionOrderModel : function () {
			var oProductionOrderModel = new JSONModel();
			
			//Load and set order model
			oProductionOrderModel.loadData("model/productionOrder/productionOrderCreate.json");
			oProductionOrderModel.attachRequestCompleted(function() {
				//Wait for date initialization until the JSON data have been loaded. Otherwise the date would be overwritten.
				oProductionOrderModel.setProperty("/orderDate", new Date());
				oProductionOrderModel.setProperty("/plannedExecutionDate", new Date());
   			 });
			
			this.getView().setModel(oProductionOrderModel, "newProductionOrder");	
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
		 * Gets the the selected production order item.
		 */
		getSelectedItem : function () {
			var oListItem = this.getView().byId("itemTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("newProductionOrder");
			var oSelectedItem = oContext.getProperty(null, oContext);
			
			return oSelectedItem;
		},
		
		
		/**
		 * Updates the item table in order to display changes of the underlying model.
		 */
		updateItemTable : function() {
			var oProductionOrderModel;
			
			//Assures that the changes of the underlying model are being displayed in the view.
			oProductionOrderModel = this.getView().getModel("newProductionOrder");
			oProductionOrderModel.refresh();						
			
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
			var oProductionOrderModel;
			
			if(this.getView().byId("plannedExecutionDatePicker").isValidValue() == false || 
				this.getView().byId("plannedExecutionDatePicker").getValue() == "") {
					
				MessageBox.error(oResourceBundle.getText("productionOrderCreate.noPlannedDateSelected"));
				return false;
			}
			
			//The order has to have at least one item.
			oProductionOrderModel = this.getView().getModel("newProductionOrder");
			iExistingItemCount = oProductionOrderModel.oData.items.length;
			
			if(iExistingItemCount < 1) {
				MessageBox.error(oResourceBundle.getText("productionOrderCreate.noItemsExist"));
				return false;
			}
			
			return true;
		}
	});
});