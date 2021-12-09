sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BillOfMaterialController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, BillOfMaterialController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.billOfMaterial.BillOfMaterialDisplay", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("billOfMaterialDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
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
			var oBillOfMaterial;
			var oBillOfMaterialModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.getView().setModel(oBillOfMaterialModel, "selectedBillOfMaterial");
				this.resetUIElements();
				return;
			}
			
			oBillOfMaterial = oBillOfMaterial = BillOfMaterialController.getBillOfMaterialById(oSelectedItem.getKey(), oBillOfMaterialsModel.oData.billOfMaterial);
			oBillOfMaterialModel.setData(oBillOfMaterial);
			
			//Set the model of the view according to the selected bill of material to allow binding of the UI elements.
			this.getView().setModel(oBillOfMaterialModel, "selectedBillOfMaterial");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("billOfMaterialComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("nameText").setText("");
			this.getView().byId("descriptionText").setText("");
			this.getView().byId("materialText").setText("");
			
			this.getView().byId("itemTable").destroyItems();
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
					MessageToast.show(oResourceBundle.getText("billOfMaterialDisplay.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "billOfMaterials");
		}
	});
});