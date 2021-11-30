sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../material/MaterialController",
	"./BillOfMaterialController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, MaterialController, BillOfMaterialController, JSONModel, MessageToast) {
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
			
			/*	this.getView().setModel(null, "selectedPurchaseOrder");
			this.resetUIElements();*/
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
		}
	});
});