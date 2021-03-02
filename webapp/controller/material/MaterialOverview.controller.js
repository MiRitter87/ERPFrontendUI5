sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
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
		_onRouteMatched: function (oEvent) {
			//Query material data every time a user navigates to this view. This assures that changes are being displayed in the table.
			this.queryMaterialWebService(true);
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
			
			this.deleteMaterial(this.getSelectedMaterial());
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
			var oContext = oListItem.getBindingContext();
			var oSelectedMaterial = oContext.getProperty(null, oContext);
			
			return oSelectedMaterial;
		},
		
		
		/**
		 * Queries the material WebService. If the call is successful, the model is updated with the material data.
		 */
		queryMaterialWebService : function(bShowSuccessMessage) {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({materials : data}); // not aData
					
					if(data.data != null) {
						if(bShowSuccessMessage == true) {
							MessageToast.show(oResourceBundle.getText("materialOverview.dataLoaded"));
						}					
					}
					else {
						if(data.message != null)
							MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
		
		
		/**
		 * Deletes the given material using the WebService.
		 */
		deleteMaterial : function(oMaterial) {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/material");
			var sQueryUrl = sWebServiceBaseUrl + "/" + oMaterial.id;
			
			//Use "DELETE" to delete an existing resource.
			var aData = jQuery.ajax({type : "DELETE", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
							this.queryMaterialWebService(false);
						}
						
						if(data.message[0].type == 'E') {
							MessageBox.error(data.message[0].text);
						}
						
						if(data.message[0].type == 'W') {
							MessageBox.warning(data.message[0].text);
						}
					}
				},
				context : this
			}); 
		}
	});

});