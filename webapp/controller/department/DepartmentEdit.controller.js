sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("departmentEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query department data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			this.getView().setModel(new JSONModel());
			this.queryDepartmentWebService(true);
			this.queryEmployeeWebService();
			
			this.getView().byId("departmentComboBox").setSelectedItem(null);
    	},
		
		
		/**
		 * Handles the selection of an item in the department ComboBox.
		 */
		onDepartmentSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oDepartments = oModel.oData.departments;
			var oDepartment;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected department from the array of all departments according to the code.
			for(var i = 0; i < oDepartments.data.department.length; i++) {
    			var oTempDepartment = oDepartments.data.department[i];
    			
				if(oTempDepartment.code == oSelectedItem.getKey()) {
					oDepartment = oTempDepartment;
				}
			}
			
			//Set the model of the view according to the selected department to allow binding of the UI elements.
			oModel.setData({departments:oDepartments, selectedDepartment : oDepartment}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the head of department ComboBox.
		 */
		onHeadSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oSelectedDepartment = oModel.oData.selectedDepartment;
			var oEmployees = oModel.oData.employees;
			var oSelectedEmployee;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected employee from the array of all employees according to the id.
			for(var i = 0; i < oEmployees.data.employee.length; i++) {
    			var oTempEmployee = oEmployees.data.employee[i];
    			
				if(oTempEmployee.id == oSelectedItem.getKey()) {
					oSelectedEmployee = oTempEmployee;
				}
			}
			
			oSelectedDepartment.head = oSelectedEmployee;
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.getView().byId("departmentComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("departmentEdit.noDepartmentSelected"));
				return;
			}
			
			if(this.getView().byId("headComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("departmentEdit.noHeadSelected"));
				return;
			}
			
			this.saveDepartmentByWebService();
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
			this.getView().byId("departmentComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryDepartmentWebService : function(bShowSuccessMessage) {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var queryUrl = webServiceBaseUrl + "/";
			var oModel = this.getView().getModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({departments : data}, true); // not aData
					
					if(data.data != null) {
						if(bShowSuccessMessage == true)
							MessageToast.show(oResourceBundle.getText("departmentEdit.dataLoaded"));
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
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function() {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oModel = this.getView().getModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employees : data}, true); // not aData
					
					if(data.data == null && data.message != null)  {
						MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
		
		
		/**
		 * Updates changes of the department data using the WebService.
		 */
		saveDepartmentByWebService : function() {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oDepartmentModel = new JSONModel(this.getView().getModel().getProperty("/selectedDepartment"));
			var sJSONData = oDepartmentModel.getJSON();
			
			//Use "PUT" to update an existing resource.
			var aData = jQuery.ajax({
				type : "PUT", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data,textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							//Update the data source of the ComboBox with the new department data.
							this.queryDepartmentWebService(false);
							//Clear ComboBox preventing display of wrong data (Code - Name).
							this.getView().byId("departmentComboBox").setSelectedKey(null);
							//Clear selectedDepartment because no ComboBox item is selected.
							this.getView().getModel().setProperty("/selectedDepartment", null);	
							MessageToast.show(data.message[0].text);
						}
						
						if(data.message[0].type == 'I') {
							MessageToast.show(data.message[0].text);
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