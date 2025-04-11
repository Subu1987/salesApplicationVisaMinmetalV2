sap.ui.define([
	"com/infocus/salesApplication/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/viz/ui5/api/env/Format",
	"com/infocus/salesApplication/libs/html2pdf.bundle",
	"jquery.sap.global"
], function(BaseController, Fragment, Filter, FilterOperator, JSONModel, MessageBox, Format, html2pdf_bundle, jQuery) {
	"use strict";

	return BaseController.extend("com.infocus.salesApplication.controller.Home", {

		/*************** on Load Functions *****************/
		onInit: function() {

			// Initialize the user ID and other parameters
			this._initializeAppData();

			// Update the global data model
			this._updateGlobalDataModel();

		},
		_initializeAppData: function() {
			/*this.getLedgerParametersData();*/
			/*this.getUserIdFromLoggedInUser();*/
			/*this._getUserIdFromLoggedInUser();*/

			this.getCustomerMasterParametersData();
		},
		_getUserIdFromLoggedInUser: function() {
			var that = this;

			// the application is running within the Fiori Launchpad
			/*if (sap.ushell && sap.ushell.Container) {
				sap.ushell.Container.getServiceAsync("UserInfo").then(function(UserInfo) {
						var userId = UserInfo.getId();
						console.log(UserInfo);
						//var userId = "1000";
						that._onGlobalUserIdSet(userId);
					})
					.catch(function(oError) {
						MessageBox.error("Error retrieving ShellUIService: " + oError.message);
						console.error("Error retrieving ShellUIService: ", oError);
					});
			} else {*/
			// Fallback method using AJAX to call /sap/bc/ui2/start_up
			jQuery.ajax({
				url: "/sap/bc/ui2/start_up",
				method: "GET",
				success: function(data) {
					var userId = data.id;
					console.log("User ID from /sap/bc/ui2/start_up:", userId);
					that._onGlobalUserIdSet(userId);
				},
				error: function(xhr, status, error) {
					MessageBox.error("Error retrieving User ID via AJAX: " + status);
					console.error("Error retrieving User ID via AJAX:", status, error);
				}
			});

			/*}*/
		},
		_onGlobalUserIdSet: function(sUserId) {
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/userId", sUserId || "");

				// Call userAuthSet after the userId is set
				this.userAuthSet();
			} else {
				console.error("Global data model is not available.");
			}
		},
		userAuthSet: function() {
			var that = this;
			var authorizationModel = this.getOwnerComponent().getModel("authorizationModel");
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oUrl = "/AUTHSet(UNAME='" + oGlobalData.userId + "')";

			sap.ui.core.BusyIndicator.show();

			authorizationModel.read(oUrl, {
				urlParameters: {
					"sap-client": "400"
				},

				success: function(response) {
					var oData = response;
					console.log(oData);

					// Check if data is available
					if (!oData || oData.length === 0) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.information('There are no data available!');
					} else {
						var oAuthDataModel = that.getOwnerComponent().getModel("authData");
						oAuthDataModel.setData(oData);
						///// Authorization Changes /////////
						var inputCompanyCode = that.byId("inputCompanyCode").getValue();
						that.totalRadioBtnCheck(inputCompanyCode);
						that.authorizationCheck();
						sap.ui.core.BusyIndicator.hide();
					}

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});
		},
		authorizationCheck: function() {
			var oAuthDataModel = this.getOwnerComponent().getModel("authData");
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			var oAuthData = oAuthDataModel.oData;
			var totalRadioBtn = oGlobalDataModel.getProperty("/totalRadioBtnChk");

			////// Authorization Change ////////
			if (oAuthData.PRS === "X") {
				oGlobalDataModel.setProperty("/prfitCentrGrp", "PRS");
				this.byId("PRS").setSelected(true);
			} else if (oAuthData.FTRS === "X") {
				oGlobalDataModel.setProperty("/prfitCentrGrp", "FTRS");
				this.byId("FTRS").setSelected(true);
			} else if (oAuthData.CORP === "X") {
				oGlobalDataModel.setProperty("/prfitCentrGrp", "CORP");
				this.byId("CORP").setSelected(true);
			} else if (totalRadioBtn === "X") {
				oGlobalDataModel.setProperty("/prfitCentrGrp", "TOTAL");
				this.byId("companytotal").setSelected(true);
			} else {
				oGlobalDataModel.setProperty("/prfitCentrGrp", "");
			}

			// var inputCompanyCode = this.byId("inputCompanyCode").getValue();
			// this.totalRadioBtnCheck(inputCompanyCode);

		},
		_updateGlobalDataModel: function() {
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/selectedTabText", "All Customer Quarterly Wise");
				oGlobalDataModel.setProperty("/isChartFragment1Visible", true);
				oGlobalDataModel.setProperty("/isChartFragment2Visible", false);
				oGlobalDataModel.setProperty("/isChartFragment3Visible", true);
				oGlobalDataModel.setProperty("/isChartFragment4Visible", false);
				oGlobalDataModel.setProperty("/isChartFragment5Visible", true);
				oGlobalDataModel.setProperty("/isChartFragment6Visible", false);
				oGlobalDataModel.setProperty("/isChartFragment7Visible", true);
				oGlobalDataModel.setProperty("/isChartFragment8Visible", false);

			} else {
				console.error("Global data model is not available.");
			}
		},
		_validateInputFields: function() {
			var inputCompanyCode = this.byId("inputCompanyCode");
			var datePickerFrom = this.byId("fromDate");
			var datePickerTo = this.byId("toDate");

			var isValid = true;
			var message = '';

			// Validate company code
			if (!inputCompanyCode.getValue()) {
				inputCompanyCode.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Company Code, ';
			} else {
				inputCompanyCode.setValueState(sap.ui.core.ValueState.None);
			}

			// Validate from date
			if (!datePickerFrom.getValue()) {
				datePickerFrom.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'From Date, ';
			} else {
				datePickerFrom.setValueState(sap.ui.core.ValueState.None);
			}

			// Validate to date
			if (!datePickerTo.getValue()) {
				datePickerTo.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'To Date, ';
			} else {
				datePickerTo.setValueState(sap.ui.core.ValueState.None);
			}

			// Display error message if any field is invalid
			if (!isValid) {
				message = message.slice(0, -2); // Remove the trailing comma and space
				sap.m.MessageBox.show("Please fill up the following fields: " + message);
				return false;
			}

			// Log date values for debugging
			console.log("From Date Value:", datePickerFrom.getValue());
			console.log("To Date Value:", datePickerTo.getValue());

			// Format dates
			var fromDate = this.formatDate(datePickerFrom.getValue());
			var toDate = this.formatDate(datePickerTo.getValue());

			// Show error message if dates are invalid
			if (!fromDate || !toDate) {
				sap.m.MessageBox.show("Invalid date format. Please enter valid dates.");
				return false;
			}

			// Set global data properties
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/cmpnyCode", inputCompanyCode.getValue());
				oGlobalDataModel.setProperty("/fromDate", fromDate);
				oGlobalDataModel.setProperty("/toDate", toDate);
			}

			return true;
		},
		formatDate: function(dateString) {
			if (!dateString) {
				console.error("Invalid Date String:", dateString);
				return null;
			}

			var parts = dateString.split(/[-/.]/); // Handle different delimiters
			if (parts.length === 3 && parts[2].length === 2) {
				var year = parts[2];
				var month = parts[0];
				var day = parts[1];

				// Convert two-digit year to four-digit
				if (year.length === 2) {
					var currentYear = new Date().getFullYear();
					var currentCentury = Math.floor(currentYear / 100) * 100;
					year = (currentCentury + parseInt(year)).toString();
				}

				// Format as "YYYYMMDD"
				var formattedDate = year + month.padStart(2, '0') + day.padStart(2, '0');
				return formattedDate;
			} else if (parts.length === 3 && parts[2].length > 2) {
				var year = parts[2];
				var month = parts[1];
				var day = parts[0];

				// Convert two-digit year to four-digit
				/*if (year.length === 2) {
					var currentYear = new Date().getFullYear();
					var currentCentury = Math.floor(currentYear / 100) * 100;
					year = (currentCentury + parseInt(year)).toString();
				}*/

				// Format as "YYYYMMDD"
				var formattedDate = year + month + day;
				return formattedDate;
			} else {
				console.error("Invalid Date String:", dateString);
				return null;
			}
		},
		onLiveChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sInputId = oInput.getId();
			var sInputValue = oInput.getValue();
			var sProperty;

			// update based on the input field ID
			if (sInputId.endsWith("--inputCompanyCode")) {
				sProperty = "/cmpnyCode";
			} else if (sInputId.endsWith("--fromDate")) {
				sProperty = "/fromDate";
			} else if (sInputId.endsWith("--toDate")) {
				sProperty = "/toDate";
			}

			/// 03.09.2024 Total Radio Btn Check based on Company Code 
			this.totalRadioBtnCheck(sInputValue);

			// Update the global data model property
			if (sProperty) {
				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty(sProperty, sInputValue);
				}
			}
		},

		/*************** get parameters data *****************/
		getCustomerMasterParametersData: function() {
			var that = this;
			var oCustomerMasterModel = this.getOwnerComponent().getModel("customerMasterModel");
			var pUrl = "/ZCUST_MASTER";

			sap.ui.core.BusyIndicator.show();
			oCustomerMasterModel.read(pUrl, {
				success: function(response) {
					var pData = response.results;
					console.log(pData);

					// Sort the data based on the Customer number (Customer field)
					pData.sort(function(a, b) {
						// Convert customer number to integers for correct numerical sorting
						return parseInt(a.Customer) - parseInt(b.Customer);
					});
					sap.ui.core.BusyIndicator.hide();

					// set the Customer data 
					var oCustomerMasterData = that.getOwnerComponent().getModel("customerMasterData");
					oCustomerMasterData.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},

		/*************** set the inputId & create the fragment *****************/

		handleValueCustomerMaster: function(oEvent) {
			this._customerInputId = oEvent.getSource().getId();
			var that = this;

			if (!this._oCustomerMasterDialog) {
				Fragment.load({
					id: that.getView().getId(),
					name: "com.infocus.salesApplication.view.dialogComponent.DialogCustomerMaster",
					controller: that
				}).then(function(oDialog) {
					that._oCustomerMasterDialog = oDialog;
					that.getView().addDependent(oDialog);
					oDialog.open();
				}).catch(function(oError) {
					console.error("Error loading Customer Master Dialog:", oError);
				});
			} else {
				this._oCustomerMasterDialog.open();
			}
		},
		handleValueFiscalYear: function(oEvent) {
			this._financialYearInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogFiscalYear) {
				this.oOpenDialogFiscalYear = sap.ui.xmlfragment("com.infocus.salesApplication.view.dialogComponent.DialogFiscalYear", this);
				this.getView().addDependent(this.oOpenDialogFiscalYear);
			}
			this.oOpenDialogFiscalYear.open();
		},
		handleValueQuarter: function(oEvent) {
			this._quarterInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogQuarter) {
				this.oOpenDialogQuarter = sap.ui.xmlfragment("com.infocus.salesApplication.view.dialogComponent.DialogQuarter", this);
				this.getView().addDependent(this.oOpenDialogQuarter);
			}
			this.oOpenDialogQuarter.open();
		},
		handleValueQuarterYear: function(oEvent) {
			this._quarterInputYearId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogQuarterYear) {
				this.oOpenDialogQuarterYear = sap.ui.xmlfragment("com.infocus.salesApplication.view.dialogComponent.DialogQuarterYear", this);
				this.getView().addDependent(this.oOpenDialogQuarterYear);
			}
			this.oOpenDialogQuarterYear.open();
		},

		/*************** search value within fragment *****************/

		onSearchCustomerMaster: function(oEvent) {
			var sQuery = oEvent.getParameter("newValue");
			var oList = Fragment.byId(this.getView().getId(), "idCustomerMasterList");
			if (!oList) return;

			var oBinding = oList.getBinding("items");
			if (!oBinding) return;

			var aFilters = [];
			if (sQuery) {
				var oFilter1 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, sQuery);
				var oFilter2 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(new sap.ui.model.Filter({
					filters: [oFilter1, oFilter2],
					and: false
				}));
			}

			oBinding.filter(aFilters);
		},
		_handleValueLedgerSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Rldnr",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		/*************** set the each property to globalData & reflect data in input field  *****************/

		/*onSelectionChangeCustomerMaster: function(oEvent) {
			var oList = oEvent.getSource();
			var aSelectedItems = oList.getSelectedItems();

			var aSelectedNames = [];
			var aSelectedIDs = [];

			aSelectedItems.forEach(function(oItem) {
				aSelectedIDs.push(oItem.getTitle()); // Customer ID
				aSelectedNames.push(oItem.getDescription()); // Customer Name
			});

			var oGlobalModel = this.getOwnerComponent().getModel("globalData");
			oGlobalModel.setProperty("/selectedCustomerNames", aSelectedNames);
			oGlobalModel.setProperty("/selectedCustomerIDs", aSelectedIDs);
		},*/

		onConfirmCustomerMaster: function() {
			var oGlobalModel = this.getOwnerComponent().getModel("globalData");
			var oList = Fragment.byId(this.getView().getId(), "idCustomerMasterList");
			var aSelectedItems = oList.getSelectedItems();
			var aSelectedNames = [];
			var aSelectedIDs = [];

			aSelectedItems.forEach(function(oItem) {
				aSelectedNames.push(oItem.getDescription()); // Name
				aSelectedIDs.push(oItem.getTitle()); // Customer
			});

			oGlobalModel.setProperty("/selectedCustomerNames", aSelectedNames);
			oGlobalModel.setProperty("/selectedCustomerIDs", aSelectedIDs);

			this._resetCustomerMasterDialog();
			this._oCustomerMasterDialog.close();
		},

		onCloseCustomerMaster: function() {
			this._resetCustomerMasterDialog();
			this._oCustomerMasterDialog.close();
		},

		_resetCustomerMasterDialog: function() {
			var oList = Fragment.byId(this.getView().getId(), "idCustomerMasterList");
			var oSearchField = Fragment.byId(this.getView().getId(), "idCustomerSearchField");

			// Clear Search
			if (oSearchField) {
				oSearchField.setValue("");
			}
			// Remove selections & filters
			if (oList) {
				oList.removeSelections(true);
				oList.getBinding("items").filter([]);
			}
		},

		_handleFiscalYearClose: function(oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"); // Get selected items (multiSelect enabled)
			var aSelectedYears = [];

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function(oItem) {
					aSelectedYears.push(oItem.getTitle()); // Collect selected years
				});

				var oFiscalYearInput = this.byId(this._fiscalYearInputId); // Ensure input ID is correct
				if (oFiscalYearInput) {
					oFiscalYearInput.setValue(aSelectedYears.join(", ")); // Display selected values in input
				}

				// Store selected fiscal years in the global model
				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/fiscalYears", aSelectedYears);
				}
			}

			// Clear filters on closing the dialog
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueQuarterClose: function(oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"); // Get selected items for multiSelect
			var aSelectedQuarters = [];

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function(oItem) {
					aSelectedQuarters.push(oItem.getTitle()); // Collect selected quarters
				});

				var oQuarterInput = this.byId(this._quarterInputId); // Ensure input ID is correct
				if (oQuarterInput) {
					oQuarterInput.setValue(aSelectedQuarters.join(", ")); // Display selected values
				}

				// Store selected quarters in the global model
				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/selectedQuarters", aSelectedQuarters);
				}
			}

			// Clear filters on closing the dialog
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleQuarterYearClose: function(oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"); // Get selected items for multiSelect
			var aSelectedYears = [];

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function(oItem) {
					aSelectedYears.push(oItem.getTitle()); // Collect selected years
				});

				var oQuarterYearInput = this.byId(this._quarterInputYearId); // Ensure input ID is correct
				if (oQuarterYearInput) {
					oQuarterYearInput.setValue(aSelectedYears.join(", ")); // Display selected values
				}

				// Store selected quarter years in the global model
				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/selectedQuarterYears", aSelectedYears);
				}
			}

			// Clear filters on closing the dialog
			oEvent.getSource().getBinding("items").filter([]);
		},

		/*************** radio Button & drop down selection  *****************/

		onRadioButtonSelectList: function(oEvent) {
			var sSelectedKey = oEvent.getSource().getSelectedIndex();

			// Get the containers (HBox elements)
			var oFiscalYearBox = this.getView().byId("fiscalYearBox");
			var oQuarterBox = this.getView().byId("quarterBox");
			var oQuarterYearBox = this.getView().byId("quarterYearBox");
			var oButtonBox = this.getView().byId("buttonBox");

			if (sSelectedKey === 0) { // Fiscal Year Wise selected
				oFiscalYearBox.setVisible(true);
				oQuarterBox.setVisible(false);
				oQuarterYearBox.setVisible(false);
				oButtonBox.setVisible(true);
			} else if (sSelectedKey === 1) { // Quarterly Wise selected
				oFiscalYearBox.setVisible(false);
				oQuarterBox.setVisible(true);
				oQuarterYearBox.setVisible(true);
				oButtonBox.setVisible(true);
			}
		},
		onChartTypeChange: function(oEvent) {
			// Get the selected radio button
			var chartType = oEvent.getSource().getSelectedKey();
			var oVizFrame = sap.ui.core.Fragment.byId(this.createId("chartFragment3"), "idVizFrame");

			oVizFrame.setVizType(chartType);

		},

		/*************** get the Icontabfilter select updated in global model  *****************/

		onTabSelect: function(oEvent) {
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			var oCustomerMasterBox = this.getView().byId("customerMasterBox");

			// Get the selected tab key
			var sSelectedKey = oEvent.getParameter("selectedKey");

			// Define the mapping of keys to text values
			var oTextMapping = {
				"scenario1": "All Customer Quarterly Wise",
				"scenario2": "Top 10 Customer Quarterly Wise",
				"scenario3": "Single Customer Quarterly Wise",
				"scenario4": "Quarterly Wise Turnover"
			};

			// visible non-visible on customer box
			if (oTextMapping[sSelectedKey] === "Single Customer Quarterly Wise") {
				oCustomerMasterBox.setVisible(true);
			} else {
				oCustomerMasterBox.setVisible(false);
			}

			// Update the global model with the corresponding text
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/selectedTabText", oTextMapping[sSelectedKey] || "");
			}
		},

		/*************** get the table data from oData service  *****************/

		hasData: function(value) {
			if (Array.isArray(value)) {
				return value.length > 0; // Check if array is not empty
			} else if (typeof value === "string") {
				return value.trim() !== ""; // Check if string is not empty
			} else if (typeof value === "number") {
				return true; // Numbers are always valid
			}
			return false; // Return false for null, undefined, or empty values
		},

		getBackendData: function() {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oSelectedTabText = oGlobalData.selectedTabText;

			if (oSelectedTabText === "All Customer Quarterly Wise") {
				this.getAllCustomerData();

			} else if (oSelectedTabText === "Top 10 Customer Quarterly Wise") {
				this.getTop10CustomerData();

			} else if (oSelectedTabText === "Single Customer Quarterly Wise") {
				this.getSingleCustomerData();

			} else {
				this.getQuarterlyData();

			}

		},

		_buildFilters: function(oGlobalData, oSelectedIndex) {
			var filters = [];

			var oSelectedTabText = oGlobalData.selectedTabText;
			var aFiscalYears = oGlobalData.fiscalYears || [];
			var aSelectedCustomerMasterData = oGlobalData.selectedCustomerIDs || [];
			var aQuarters = oGlobalData.selectedQuarters || [];
			var aQuarterYears = oGlobalData.selectedQuarterYears || [];

			if (oSelectedIndex === 0) {
				if (aFiscalYears.length > 0) {
					filters.push(new Filter({
						filters: aFiscalYears.map(function(year) {
							return new Filter("fiscalYear", FilterOperator.EQ, year);
						}),
						and: false
					}));
				}
			} else {
				var quarterFilters = aQuarters.map(function(quarter) {
					return new Filter("fiscalQuater", FilterOperator.EQ, quarter); // double-check spelling
				});
				var quarterYearFilters = aQuarterYears.map(function(year) {
					return new Filter("quater_Year", FilterOperator.EQ, year); // double-check spelling
				});
				if (quarterFilters.length && quarterYearFilters.length) {
					filters.push(new Filter({
						filters: [
							new Filter({
								filters: quarterFilters,
								and: false
							}),
							new Filter({
								filters: quarterYearFilters,
								and: false
							})
						],
						and: true
					}));
				}
			}

			// Add customer filter (for both tabs)
			if (oSelectedTabText === "Single Customer Quarterly Wise" && aSelectedCustomerMasterData.length > 0) {
				filters.push(new Filter({
					filters: aSelectedCustomerMasterData.map(function(cust) {
						return new Filter("customer", FilterOperator.EQ, cust);
					}),
					and: false
				}));
			}

			return filters;
		},
		getAllCustomerData: function() {
			var that = this;

			// Retrieve models once to avoid redundant calls
			var oComponent = this.getOwnerComponent();
			var oAllCustomerModel = oComponent.getModel("allCustomerModel");
			var oGlobalDataModel = oComponent.getModel("globalData");
			var oGlobalData = oGlobalDataModel.getData();
			var oAllCustListDataModel = oComponent.getModel("allCustlistData");
			var oSelectedIndex = this.byId("radioBtnlist").getSelectedIndex();

			// reusable filter function 
			var filters = this._buildFilters(oGlobalData, oSelectedIndex);

			// Show busy indicator
			sap.ui.core.BusyIndicator.show();

			// OData call to fetch data
			oAllCustomerModel.read("/CUSTSet", {
				urlParameters: {
					"sap-client": "300"
				},
				filters: filters,
				success: function(response) {
					var oData = response.results || [];
					console.log("Raw Response Data:", oData);

					// Convert Turn Over to Crores
					oData.forEach(function(item) {
						if (item.turnOver) {
							item.turnOver = (parseFloat(item.turnOver) / 10000000).toFixed(2); // Convert to Crore and round to 2 decimals
						}

						// Dynamically generate short name from customerName
						var words = item.customerName.split(" ");
						var abbreviation = words
							.filter(w => w.length > 2 && w[0] === w[0].toUpperCase())
							.map(w => w[0])
							.join("")
							.toUpperCase();

						item.CustomerNameShort = abbreviation || item.customerName;
					});

					// Update models based on selection
					var isSelectedIndex = oSelectedIndex === 0;
					var sPropertyPath = isSelectedIndex ? "/allCustlistDataFiscalYearWise" : "/allCustlistDataQuaterlyWise";
					var sFragmentId = isSelectedIndex ? "chartFragment1" : "chartFragment2";

					oAllCustListDataModel.setProperty(sPropertyPath, oData);

					// Toggle visibility of chart fragments
					oGlobalDataModel.setProperty("/isChartFragment1Visible", isSelectedIndex);
					oGlobalDataModel.setProperty("/isChartFragment2Visible", !isSelectedIndex);
					
					// Bind chart
					isSelectedIndex ? that.bindChartColorRulesByFiscalYearWise(sFragmentId, oData) : that.bindChartColorRulesByQuarterlyWise(
						sFragmentId, oData);

					// Check if data is available
					sap.ui.core.BusyIndicator.hide();
					if (!oData.length) {
						sap.m.MessageBox.information("There are no data available!");
					}
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.error(error);

					try {
						var errorObject = JSON.parse(error.responseText);
						sap.m.MessageBox.error(errorObject.error.message.value);
					} catch (e) {
						sap.m.MessageBox.error("An unexpected error occurred.");
					}
				}
			});
		},
		getTop10CustomerData: function() {
			var that = this;

			// Retrieve models once to avoid redundant calls
			var oComponent = this.getOwnerComponent();
			var oTop10CustomerModel = oComponent.getModel("top10CustomerModel");
			var oGlobalDataModel = oComponent.getModel("globalData");
			var oGlobalData = oGlobalDataModel.getData();
			var oTop10CustListDataModel = oComponent.getModel("top10listData");
			var oSelectedIndex = this.byId("radioBtnlist").getSelectedIndex();

			// reusable filter function 
			var filters = this._buildFilters(oGlobalData, oSelectedIndex);

			// Show busy indicator
			sap.ui.core.BusyIndicator.show();

			// OData call to fetch data
			oTop10CustomerModel.read("/CUSTSet", {
				urlParameters: {
					"sap-client": "300"
				},
				filters: filters,
				success: function(response) {
					var oData = response.results || [];
					console.log(oData);

					// Convert Turn Over to Crores
					oData.forEach(function(item) {
						if (item.turnover) {
							item.turnover = (parseFloat(item.turnover) / 10000000).toFixed(2); // Convert to Crore and round to 2 decimals
						}

						// Dynamically generate short name from customerName
						var words = item.customerName.split(" ");
						var abbreviation = words
							.filter(w => w.length > 2 && w[0] === w[0].toUpperCase())
							.map(w => w[0])
							.join("")
							.toUpperCase();

						item.CustomerNameShort = abbreviation || item.customerName;
					});

					// Update models based on selection
					var isSelectedIndex = oSelectedIndex === 0;
					var sPropertyPath = isSelectedIndex ? "/top10CustlistDataFiscalYearWise" : "/top10CustlistDataQuaterlyWise";
					var sFragmentId = isSelectedIndex ? "chartFragment3" : "chartFragment4";

					oTop10CustListDataModel.setProperty(sPropertyPath, oData);

					// Toggle visibility of chart fragments
					oGlobalDataModel.setProperty("/isChartFragment3Visible", isSelectedIndex);
					oGlobalDataModel.setProperty("/isChartFragment4Visible", !isSelectedIndex);

					// Bind chart
					isSelectedIndex ? that.bindChartColorRulesByFiscalYearWise(sFragmentId, oData) : that.bindChartColorRulesByQuarterlyWise(
						sFragmentId, oData);

					// Check if data is available
					sap.ui.core.BusyIndicator.hide();
					if (!oData.length) {
						sap.m.MessageBox.information("There are no data available!");
					}
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.error(error);

					try {
						var errorObject = JSON.parse(error.responseText);
						sap.m.MessageBox.error(errorObject.error.message.value);
					} catch (e) {
						sap.m.MessageBox.error("An unexpected error occurred.");
					}
				}
			});
		},
		generateColorMapByFiscalYearWise: function(data) {
			const colorMap = {};
			const uniqueKeys = [...new Set(data.map(item => item.CustomerNameShort + " (" + item.fiscalYear + ")"))];

			uniqueKeys.forEach((key, i) => {
				const color = `hsl(${(i * 43) % 360}, 70%, 50%)`;
				colorMap[key] = color;
			});

			return {
				colorMap: colorMap,
			};
		},
		bindChartColorRulesByFiscalYearWise: function(sFragmentId, oData) {
			var oVizFrame = sap.ui.core.Fragment.byId(this.createId(sFragmentId), "idVizFrame");
			const result = this.generateColorMapByFiscalYearWise(oData);
			const colorMap = result.colorMap;

			if (!oVizFrame) {
				console.warn("VizFrame not found for Fragment ID:", sFragmentId);
				return;
			}

			const rules = oData.map(item => {
				const customerYear = item.CustomerNameShort + " (" + item.fiscalYear + ")";
				return {
					dataContext: {
						"Customer Name": item.CustomerNameShort,
						"Fiscal Year": item.fiscalYear
					},
					properties: {
						color: colorMap[customerYear]
					}
				};
			});

			oVizFrame.setVizProperties({
				sizeLegend: {
					visible: false
				},
				categoryAxis: {
					layout: {
						maxHeight: 100
					},
					label: {
						rotation: "45",
						visible: true
					}
				},
				plotArea: {
					dataPointStyle: {
						rules: rules
					},
					dataLabel: {
						visible: true
					},
					drawingEffect: "glossy",
					tooltip: {
						visible: true,
						formatString: [
							"Customer: {customerName}", // <-- Show full name here
							"Fiscal Year: {Fiscal Year}",
							"Turnover: {turnover} Cr"
						]
					}
				}
			});

		},
		generateColorMapByQuarterlyWise: function(data) {
			const colorMap = {};

			const uniqueKeys = [...new Set(data.map(item => item.CustomerNameShort + " (" + item.quater + " " + item.quaterYear + ")"))];

			uniqueKeys.forEach((key, i) => {
				const color = `hsl(${(i * 37) % 360}, 65%, 55%)`;
				colorMap[key] = color;
			});

			return {
				colorMap: colorMap,
			};
		},
		bindChartColorRulesByQuarterlyWise: function(sFragmentId, oData) {
			const oVizFrame = sap.ui.core.Fragment.byId(this.createId(sFragmentId), "idVizFrame");
			const result = this.generateColorMapByQuarterlyWise(oData);
			const colorMap = result.colorMap;

			if (!oVizFrame) {
				console.warn("VizFrame not found for Fragment ID:", sFragmentId);
				return;
			}

			const rules = oData.map(item => {
				const customerQuarter = item.CustomerNameShort + " (" + item.quater + " " + item.quaterYear + ")";
				return {
					dataContext: {
						"Customer Name": item.CustomerNameShort,
						"Quarter": item.quater,
						"Quarter Year": item.quaterYear
					},
					properties: {
						color: colorMap[customerQuarter]
					}
				};
			});

			oVizFrame.setVizProperties({
				plotArea: {
					dataPointStyle: {
						rules: rules
					},
					dataLabel: {
						visible: true
					},
					drawingEffect: "glossy"
				}
			});
		},

		getSingleCustomerData: function() {
			var that = this;

			// Retrieve models once to avoid redundant calls
			var oComponent = this.getOwnerComponent();
			var oSingleCustomerModel = oComponent.getModel("singleCustomerModel");
			var oGlobalDataModel = oComponent.getModel("globalData");
			var oGlobalData = oGlobalDataModel.getData();
			var oSingleCustListDataModel = oComponent.getModel("singleCustlistData");
			var oSelectedIndex = this.byId("radioBtnlist").getSelectedIndex();

			// reusable filter function 
			var filters = this._buildFilters(oGlobalData, oSelectedIndex);

			// Show busy indicator
			sap.ui.core.BusyIndicator.show();

			// OData call to fetch data
			oSingleCustomerModel.read("/CUSTSet", {
				urlParameters: {
					"sap-client": "300"
				},
				filters: filters,
				success: function(response) {
					var oData = response.results || [];
					console.log(oData);

					// Convert Turn Over to Crores
					oData.forEach(function(item) {
						if (item.turnOver) {
							item.turnOver = (parseFloat(item.turnOver) / 10000000).toFixed(2); // Convert to Crore and round to 2 decimals
						}
						
						// Dynamically generate short name from customerName
						var words = item.customerName.split(" ");
						var abbreviation = words
							.filter(w => w.length > 2 && w[0] === w[0].toUpperCase())
							.map(w => w[0])
							.join("")
							.toUpperCase();

						item.CustomerNameShort = abbreviation || item.customerName;
					});

					// Update models based on selection
					var isSelectedIndex = oSelectedIndex === 0;
					var sPropertyPath = isSelectedIndex ? "/singleCustlistDataFiscalYearWise" : "/singleCustlistDataQuaterlyWise";
					var sFragmentId = isSelectedIndex ? "chartFragment5" : "chartFragment6";
					
					oSingleCustListDataModel.setProperty(sPropertyPath, oData);

					// Toggle visibility of chart fragments
					oGlobalDataModel.setProperty("/isChartFragment5Visible", isSelectedIndex);
					oGlobalDataModel.setProperty("/isChartFragment6Visible", !isSelectedIndex);
					
					// Bind chart
					isSelectedIndex ? that.bindChartColorRulesByFiscalYearWise(sFragmentId, oData) : that.bindChartColorRulesByQuarterlyWise(
						sFragmentId, oData);

					// Check if data is available
					sap.ui.core.BusyIndicator.hide();
					if (!oData.length) {
						sap.m.MessageBox.information("There are no data available!");
					}
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.error(error);

					try {
						var errorObject = JSON.parse(error.responseText);
						sap.m.MessageBox.error(errorObject.error.message.value);
					} catch (e) {
						sap.m.MessageBox.error("An unexpected error occurred.");
					}
				}
			});
		},
		getQuarterlyData: function() {
			var that = this;

			// Retrieve models once to avoid redundant calls
			var oComponent = this.getOwnerComponent();
			var oQuarterlyTurnoverModel = oComponent.getModel("quarterlyTurnoverModel");
			var oGlobalDataModel = oComponent.getModel("globalData");
			var oGlobalData = oGlobalDataModel.getData();
			var oQuarterlyTurnoverlistDataModel = oComponent.getModel("quarterlyTurnoverlistData");
			var oSelectedIndex = this.byId("radioBtnlist").getSelectedIndex();

			// reusable filter function 
			var filters = this._buildFilters(oGlobalData, oSelectedIndex);

			// Show busy indicator
			sap.ui.core.BusyIndicator.show();

			// OData call to fetch data
			oQuarterlyTurnoverModel.read("/CUSTSet", {
				urlParameters: {
					"sap-client": "300"
				},
				filters: filters,
				success: function(response) {
					var oData = response.results || [];
					console.log(oData);

					// Convert Turn Over to Crores
					oData.forEach(function(item) {
						if (item.turnOver) {
							item.turnOver = (parseFloat(item.turnOver) / 10000000).toFixed(2); // Convert to Crore and round to 2 decimals
						}
					});

					// Update models based on selection
					var sPropertyPath = oSelectedIndex === 0 ? "/quarterlyTurnoverlistDataFiscalYearWise" :
						"/quarterlyTurnoverlistDataQuaterlyWise";
					oQuarterlyTurnoverlistDataModel.setProperty(sPropertyPath, oData);

					// Toggle visibility of chart fragments
					oGlobalDataModel.setProperty("/isChartFragment7Visible", oSelectedIndex === 0);
					oGlobalDataModel.setProperty("/isChartFragment8Visible", oSelectedIndex !== 0);

					// Check if data is available
					sap.ui.core.BusyIndicator.hide();
					if (!oData.length) {
						sap.m.MessageBox.information("There are no data available!");
					}
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.error(error);

					try {
						var errorObject = JSON.parse(error.responseText);
						sap.m.MessageBox.error(errorObject.error.message.value);
					} catch (e) {
						sap.m.MessageBox.error("An unexpected error occurred.");
					}
				}
			});
		},
		_formatDecimalProperties: function(obj, then) {
			for (var key in obj) {

				if (key === 'Hkont') {
					continue;
				} else if (typeof obj[key] === "object") {
					continue;
				} else if (!isNaN(parseFloat(obj[key])) && isFinite(obj[key])) {
					obj[key] = parseFloat(obj[key]).toFixed(2);
				}
			}

		},
		clearListData: function() {
			var that = this;

			sap.m.MessageBox.confirm(
				"Are you sure you want to clear all data?", {
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							// Clear input fields
							/*that.byId("inputLedger").setValue("0L");*/
							var ocompanyCodeDataModel = that.getOwnerComponent().getModel("companyCodeData");
							var oCmpCodeData = ocompanyCodeDataModel.oData;
							that.byId("inputCompanyCode").setValue(oCmpCodeData[0].Companycode); //// Authorization Change ////
							that.totalRadioBtnCheck(oCmpCodeData[0].Companycode);
							/////  Authorization Changes //////
							that.authorizationCheck();
							that.byId("fromDate").setValue("");
							that.byId("toDate").setValue("");

							// Deselect radio buttons
							// that.byId("PRS").setSelected(true);
							// that.byId("FTRS").setSelected(false);
							// that.byId("CORP").setSelected(false);
							/*that.byId("companytotal").setSelected(false);*/
							that.byId("detailedlist").setSelected(true);
							that.byId("summarylist").setSelected(false);

							// Clear list data
							var oListDataModel = that.getOwnerComponent().getModel("listData");
							oListDataModel.setData({});

							// clear the chart data 
							var oChartDataModel = that.getOwnerComponent().getModel("chartData");
							oChartDataModel.setData({});

							// Update global data model properties
							var oGlobalDataModel = that.getOwnerComponent().getModel("globalData");
							if (oGlobalDataModel) {
								oGlobalDataModel.setProperty("/listFlag", "X");
								oGlobalDataModel.setProperty("/togglePanelVisibility", "X");
							}
							// disbaled the switches
							that._toggleSwitches(false);

							// change the state of switches 
							/*that.byId("splitViewSwitch").setState(false);*/
							that.byId("tabularDataSwitch").setState(false);
							that.byId("chartDataSwitch").setState(false);

							// SplitterLayoutData elements
							var oSplitterLayoutData1 = that.byId("splitterLayoutData1");
							var oSplitterLayoutData2 = that.byId("splitterLayoutData2");
							oSplitterLayoutData1.setSize("0%");
							oSplitterLayoutData2.setSize("100%");

							that._columnVisible();
							that.byId("downloadPdfBtn").setEnabled(false);
						}
					}
				}
			);
		},

		/*************** chart function & plotting the chart data  *****************/

		loadDefaultGraph: function() {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oListData = this.getOwnerComponent().getModel("listData").getData();
			var defaultFilterChartData = oListData[0]; // Assuming default data is at index 0
			var extractChartData = this.extractData(defaultFilterChartData);

			// Set default chart data
			this.getOwnerComponent().getModel("chartData").setData(extractChartData);

			// Set default panel visibility
			oGlobalData.togglePanelVisibility = defaultFilterChartData.DET_FLAG === "X" ? "X" : "";
			this.getOwnerComponent().getModel("globalData").setData(oGlobalData);

			// highlight the default table 
			/*var oTable = this.byId("dynamicTable");
			var aItems = oTable.getItems();*/
			this._highlightRow(0);
		},
		onChartButtonPress: function(oEvent) {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oListData = this.getOwnerComponent().getModel("listData").getData();
			var oChartDataModel = this.getOwnerComponent().getModel("chartData");

			var oButton = oEvent.getSource();
			var oRow = oButton.getParent();
			var oTable = this.byId("dynamicTable");
			var iIndex = oTable.indexOfItem(oRow);
			// Highlight the clicked row
			this._highlightRow(iIndex);

			var filterChartData = oListData[iIndex];
			var extractChartData = this.extractData(filterChartData);
			oChartDataModel.setData(extractChartData);

			// set the globaldata
			oGlobalData.togglePanelVisibility = oListData[0].DET_FLAG === "X" ? "X" : "";
			this.getOwnerComponent().getModel("globalData").setData(oGlobalData);

			// SplitterLayoutData elements
			var oSplitterLayoutData1 = this.byId("splitterLayoutData1");
			var oSplitterLayoutData2 = this.byId("splitterLayoutData2");

			// set the split view switch state to true
			/*this.byId("splitViewSwitch").setState(true);*/
			this.byId("tabularDataSwitch").setState(false);
			this.byId("chartDataSwitch").setState(true);

			// Update SplitterLayoutData sizes for split view
			oSplitterLayoutData1.setSize("0%");
			oSplitterLayoutData2.setSize("100%");

		},
		extractData: function(obj) {
			var result = [];
			var months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

			// Combine incoming and outgoing balances for each month
			for (var i = 0; i < 12; i++) {
				var month = months[i];
				var incomingKey = "I" + (i + 1 < 10 ? '0' + (i + 1) : i + 1);
				var outgoingKey = "U" + (i + 1 < 10 ? '0' + (i + 1) : i + 1);
				var incomingValue = parseFloat(obj[incomingKey]);
				var outgoingValue = parseFloat(obj[outgoingKey]);

				result.push({
					Month: month,
					IncomingBalance: incomingValue,
					OutgoingBalance: outgoingValue
				});
			}

			var oVizFrame = this.byId("oVizFrame");
			oVizFrame.setVizProperties({
				title: {
					visible: true,
					text: obj.GlText
				},
				legend: {
					title: {
						visible: true,
						text: 'Months'
					}
				},
				plotArea: {
					dataLabel: {
						visible: true,
						showTotal: true,
					},
					colorPalette: ['#00e600', '#0000b3'] // Green for IncomingBalance, Orange for OutgoingBalance
				}
			});

			return result;
		},
		_highlightRow: function(iIndex) {
			var oTable = this.byId("dynamicTable");
			oTable.getItems().forEach(function(item, index) {
				if (index === iIndex) {
					item.addStyleClass("highlightedRow");
				} else {
					item.removeStyleClass("highlightedRow");
				}
			});
		},
		_removeHighlight: function() {
			var oTable = this.byId("dynamicTable");
			oTable.getItems().forEach(function(item) {
				item.removeStyleClass("highlightedRow");
			});
		}

	});
});