sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"./MaterialController"
], function (Controller, MessageToast, MessageBox, JSONModel, MaterialController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.material.MaterialOverview", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("materialOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query material data every time a user navigates to this view. This assures that changes are being displayed in the table.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, true);
    	},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isMaterialSelected() == false) {
				MessageBox.error(oResourceBundle.getText("materialOverview.noMaterialSelected"));
				return;
			}
			
			MaterialController.deleteMaterialByWebService(this.getSelectedMaterial(), this.deleteMaterialCallback, this);
		},
		
		
		/**
		 * Checks if a material has been selected.
		 */
		isMaterialSelected : function () {
			if(this.getView().byId("materialTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected material.
		 */
		getSelectedMaterial : function () {
			var oListItem = this.getView().byId("materialTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("materials");
			var oSelectedMaterial = oContext.getProperty(null, oContext);
			
			return oSelectedMaterial;
		},
		
		
		/**
		 * Callback function of the queryMaterial RESTful WebService call in the MaterialController.
		 */
		queryMaterialsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true) {
					MessageToast.show(oResourceBundle.getText("materialOverview.dataLoaded"));
				}					
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}

			oCallingController.getView().setModel(oModel, "materials");
		},
		
		
		/**
		 * Callback function of the deleteMaterial RESTful WebService call in the MaterialController.
		 */
		deleteMaterialCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					MaterialController.queryMaterialsByWebService(oCallingController.queryMaterialsCallback, oCallingController, false);
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