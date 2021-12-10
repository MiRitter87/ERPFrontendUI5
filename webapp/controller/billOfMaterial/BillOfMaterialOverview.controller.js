sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BillOfMaterialController",
	"../MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, BillOfMaterialController, MainController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.billOfMaterial.BillOfMaterialOverview", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("billOfMaterialOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			BillOfMaterialController.queryBillOfMaterialsByWebService(this.queryBillOfMaterialsCallback, this, true);
    	},


		/**
		 * Handles the press-event of the show details button.
		 */
		onShowDetailsPressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oSelectedBillOfMaterialModel;
			
			if(this.isBillOfMaterialSelected() == false) {
				MessageBox.error(oResourceBundle.getText("billOfMaterialOverview.noBillOfMaterialSelected"));
				return;
			}
			
			oSelectedBillOfMaterialModel = new JSONModel();
			oSelectedBillOfMaterialModel.setData(this.getSelectedBillOfMaterial());
			this.getView().setModel(oSelectedBillOfMaterialModel, "selectedBillOfMaterial");		
			
			MainController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.billOfMaterial.BillOfMaterialOverviewDetails");
		},
		
		
		/**
		 * Handles a click at the close button of the account details fragment.
		 */
		onCloseDialog : function () {
			this.byId("billOfMaterialDetailsDialog").close();
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
					MessageToast.show(oResourceBundle.getText("billOfMaterialOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "billOfMaterials");
		},
		
		
		/**
		 * Checks if a bill of material has been selected.
		 */
		isBillOfMaterialSelected : function () {
			if(this.getView().byId("billOfMaterialTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected bill of material.
		 */
		getSelectedBillOfMaterial : function () {
			var oListItem = this.getView().byId("billOfMaterialTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("billOfMaterials");
			var oSelectedBillOfMaterial = oContext.getProperty(null, oContext);
			
			return oSelectedBillOfMaterial;
		}
	});
});