sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentOverview", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("departmentOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query department data every time a user navigates to this view. This assures that changes are being displayed in the table.
			this.queryDepartmentWebService(true);
    	},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isDepartmentSelected() == false) {
				MessageBox.error(oResourceBundle.getText("departmentOverview.noDepartmentSelected"));
				return;
			}
			
			this.deleteDepartment(this.getSelectedDepartment());
		},
		
		
		/**
		 * Checks if a department has been selected.
		 */
		isDepartmentSelected : function () {
			if(this.getView().byId("departmentTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected department.
		 */
		getSelectedDepartment : function () {
			var oListItem = this.getView().byId("departmentTable").getSelectedItem();
			var oContext = oListItem.getBindingContext();
			var oSelectedDepartment = oContext.getProperty(null, oContext);
			
			return oSelectedDepartment;
		},
		
		
		/**
		 * Queries the department WebService. If the call is successful, the model is updated with the department data.
		 */
		queryDepartmentWebService : function(bShowSuccessMessage) {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({departments : data}); // not aData
					
					if(data.data != null) {
						if(bShowSuccessMessage == true) {
							MessageToast.show(oResourceBundle.getText("departmentOverview.dataLoaded"));
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
		 * Deletes the given department using the WebService.
		 */
		deleteDepartment : function(oDepartment) {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/" + oDepartment.code;
			
			//Use "DELETE" to delete an existing resource.
			var aData = jQuery.ajax({type : "DELETE", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
							this.queryDepartmentWebService(false);
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
		},
	});

});