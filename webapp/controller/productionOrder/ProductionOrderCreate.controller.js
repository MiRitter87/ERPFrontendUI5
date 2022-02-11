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
		 * Opens the dialog to add a new sales order item.
		 */
		onAddItemPressed : function () {
			ProductionOrderController.setIdOfNewItem(this.getView().getModel("newProductionOrder"), this);
			MainController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.productionOrder.ProductionOrderItemCreate");
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
	});
});