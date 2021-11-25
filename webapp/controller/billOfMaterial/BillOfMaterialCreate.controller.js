sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../material/MaterialController",
	"./BillOfMaterialController",
	"../MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, MaterialController, BillOfMaterialController, MainController, JSONModel, MessageToast) {
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
		 * Opens the dialog to add a new bill of material item.
		 */
		onAddItemPressed : function () {
			BillOfMaterialController.setIdOfNewItem(this.getView().getModel("newBillOfMaterial"), this);
			MainController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.billOfMaterial.BillOfMaterialItemCreate");
		},
		
		
		/**
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			//TODO 
			//PurchaseOrderController.clearItemPopUpFields(this);
			BillOfMaterialController.initializeBillOfMaterialItemModel(this);
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
			return "TODO";
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return "TODO";
		},
		
		
		/**
		 * Resets the form fields to the initial state.
		 */
		resetFormFields : function () {
			this.getView().byId("materialComboBox").setSelectedItem(null);
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
		}
	});
});