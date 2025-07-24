import { NextRequest, NextResponse } from 'next/server';

// Types based on the actual API structure
interface WorkGroupLevel {
  wgLevel: number;
  wgNum: number;
  caption: string;
}

interface WorkGroup {
  description: string;
  workPositionWgName: string;
  workPositionWgCode: string;
  workPositionName: string;
  workPositionAbb: string;
  levels: WorkGroupLevel[];
}

interface Address {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  stateProv: string;
  postalCode: string;
  created: string;
  editing: {
    editable: boolean;
    presentInConfig: boolean;
  };
}

interface PhoneNumber {
  phonePosIndex: number;
  phoneLabel: string;
  phoneNumber: string;
  editing: {
    editable: boolean;
    presentInConfig: boolean;
  };
}

interface Email {
  emailPosIndex: number;
  emailLabel: string;
  emailAddress: string;
  editing: {
    editable: boolean;
    presentInConfig: boolean;
  };
}

interface ContactInfo {
  phoneNumbers: PhoneNumber[];
  emails: Email[];
  devices: { platform: string; }[];
}

interface PersonalInfo {
  address: Address;
  contactInfo: ContactInfo;
  emergency: {
    emergencyContact: string;
    editing: {
      editable: boolean;
      presentInConfig: boolean;
    };
  };
  customFields: any[];
  eula: {
    attest: boolean;
    lastModified: string;
    url: string | null;
  };
}

interface WgRenderingLevel {
  wgLevel: number;
  name: string;
  plural: string;
  captionUses: string;
}

interface Transaction {
  timestamp: string;
  transType: number;
  station: number;
  id: string;
}

interface MonitoredItems {
  arrival: {
    beforeStart?: boolean;
    afterStart: boolean;
  };
  departure: {
    beforeEnd?: boolean;
    afterEnd: boolean;
  };
  intervals: {
    inDiff?: number;
    outDiff?: number;
    inDiffRnd?: number;
    outDiffRnd: number;
  };
  shiftExceptions: any[];
  breakEvents: any[];
  zones: any[];
  nonWorkedEvents: any[];
}

interface WorkedShift {
  date: string;
  dop: number;
  dow: number;
  grossHours: number;
  hours: number;
  hundHours: number;
  shiftNum: number;
  scheduled: boolean;
  hasWorkSchedule: boolean;
  hasFlexSchedule: boolean;
  isWorkedHoliday: boolean;
  isOddPunchState: boolean;
  isVirtualShift: boolean;
  lastPunchState: number;
  active: boolean;
  transactions: {
    count: number;
    actual: Transaction[];
    rounded: any[];
  };
  monitoredItems: MonitoredItems;
}

interface Operation {
  operation: number;
  description: string;
  caption: string;
  fkeyguid: string; // This is the unique identifier for operations
  hint: string;
  icon: string;
  prerequisites?: {
    captureGps: boolean;
    faceVerify: boolean;
    geoZone: boolean;
    autoXfer: boolean;
    transRuleGuid?: string;
    requireGps: boolean;
    enabled: boolean;
  };
  prompts?: {
    askForTransType: boolean;
    defaultTransType: number;
    selections: PromptSelection[];
    askForCallback?: boolean;
    defaultCallback?: number;
    callbackSelections?: PromptSelection[];
    askForXfer?: boolean;
    xferOperation?: Operation;
    defaultWg?: any;
  };
  alsoPunch?: boolean;
  transType?: number;
  callbackTransType?: number;
  xferStyle?: number;
  xferStyleDescr?: string;
  wgRendering?: {
    caption: string;
    levels: WgRenderingLevel[];
  };
  tip1?: {
    prompt: boolean;
    caption: string;
    hint: string;
    payDesId: number;
  };
  tip2?: {
    prompt: boolean;
    caption: string;
    hint: string;
    payDesId: number;
  };
  promptForEffDate?: boolean;
  memo?: string;
  days?: number;
  catA?: {
    prompt: boolean;
    caption: string;
    defaultId: number;
    selections: any[];
  };
  catB?: {
    prompt: boolean;
    caption: string;
    defaultId: number;
    selections: any[];
  };
}
interface PromptSelection {
  id: number;
  caption: string;
}
interface Context {
  focusDate: string;
  currentTime: string;
  demoMode: boolean;
  previousPeriodBegins: string;
  previousPeriodEnds: string;
  currentPeriodBegins: string;
  currentPeriodEnds: string;
  workedShifts: WorkedShift[];
  impliedStation: number;
  maySetAvailability: boolean;
  canSeeCoWorkerSch: boolean;
  canSeeOpenAssignments: boolean;
  canSeeOpenSchedules: boolean;
  openSchWGLevel: number;
  inOutStateId: number;
  defaultWg: WorkGroup;
  operations: Operation[];
}

interface KioskStartupResponse {
  basics: {
    filekey: number;
    lastName: string;
    firstName: string;
    middle: string;
    idnum: string;
    badge: number;
    homeWg: WorkGroup;
    homeWgSet: {
      levels: Array<{
        wgLevel: number;
        wgNum: number;
      }>;
    };
    homeWgEffDate: string;
  };
  personalInfo: PersonalInfo;
  profileInfo: any;
  company: any;
  time: any;
  application: any;
  operator: any;
  schStyles: any[];
  context: Context;
}

export async function GET(request: NextRequest) {
  try {
    // Extract employee ID from query params or headers
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || searchParams.get('employee_id');
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Mock data based on the actual API structure from exampleStartUp.json
    const mockData: KioskStartupResponse = {
      basics: {
        filekey: 369,
        lastName: "Smith",
        firstName: "John",
        middle: "",
        idnum: employeeId,
        badge: 575575,
        homeWg: {
          description: "Production Floor-Machine Operator-Default-Manufacturing",
          workPositionWgName: "Machine Operator",
          workPositionWgCode: "MOP",
          workPositionName: "Machine Operator",
          workPositionAbb: "MOP",
          levels: [
            {
              wgLevel: 1,
              wgNum: 3,
              caption: "Production Floor"
            },
            {
              wgLevel: 4,
              wgNum: 66,
              caption: "Machine Operator"
            },
            {
              wgLevel: 2,
              wgNum: 1,
              caption: "Default"
            },
            {
              wgLevel: 3,
              wgNum: 9,
              caption: "Manufacturing"
            }
          ]
        },
        homeWgSet: {
          levels: [
            {
              wgLevel: 1,
              wgNum: 3
            },
            {
              wgLevel: 2,
              wgNum: 1
            },
            {
              wgLevel: 3,
              wgNum: 9
            },
            {
              wgLevel: 4,
              wgNum: 66
            }
          ]
        },
        homeWgEffDate: "2024-01-01T00:00:00.000"
      },
      personalInfo: {
        address: {
          addressLine1: "123 Main Street",
          addressLine2: "",
          addressLine3: "",
          city: "Manufacturing City",
          stateProv: "MI",
          postalCode: "48262",
          created: "2024-01-01T00:00:00.000",
          editing: {
            editable: false,
            presentInConfig: false
          }
        },
        contactInfo: {
          phoneNumbers: [
            {
              phonePosIndex: 0,
              phoneLabel: "Work Phone",
              phoneNumber: "8102311963",
              editing: {
                editable: true,
                presentInConfig: true
              }
            },
            {
              phonePosIndex: 1,
              phoneLabel: "Home Phone",
              phoneNumber: "5551234567",
              editing: {
                editable: true,
                presentInConfig: true
              }
            },
            {
              phonePosIndex: 2,
              phoneLabel: "Cell Phone",
              phoneNumber: "5559876543",
              editing: {
                editable: true,
                presentInConfig: true
              }
            }
          ],
          emails: [
            {
              emailPosIndex: 0,
              emailLabel: "Work Email",
              emailAddress: "john.smith@company.com",
              editing: {
                editable: true,
                presentInConfig: true
              }
            },
            {
              emailPosIndex: 1,
              emailLabel: "Personal Email",
              emailAddress: "john.smith.personal@gmail.com",
              editing: {
                editable: true,
                presentInConfig: true
              }
            }
          ],
          devices: [
            {
              platform: "Windows"
            }
          ]
        },
        emergency: {
          emergencyContact: "",
          editing: {
            editable: true,
            presentInConfig: true
          }
        },
        customFields: [],
        eula: {
          attest: true,
          lastModified: "2025-07-22T10:44:36.020",
          url: null
        }
      },
      profileInfo: {
        profileName: "John",
        guid: "{21178A09-E594-4918-BF09-20C64172984A}",
        createdBy: "",
        sheetId: 0,
        sheetName: "Default (Time Card)",
        allSheets: false,
        schSheetId: 1,
        arcSheetId: 1,
        benSheetId: 1,
        piSheetId: 2,
        piSheetName: "Customized Layout",
        msgSheetId: 1,
        leaveSheetId: 1,
        wgRendering: {
          caption: "",
          levels: [
            {
              wgLevel: 1,
              name: "Location",
              plural: "",
              captionUses: "wgName"
            },
            {
              wgLevel: 4,
              name: "Position Name/Code",
              plural: "Position Name/Code",
              captionUses: "wgNum"
            },
            {
              wgLevel: 2,
              name: "Zone",
              plural: "",
              captionUses: "wgName"
            },
            {
              wgLevel: 3,
              name: "Department",
              plural: "",
              captionUses: "wgName"
            }
          ]
        },
        enablePunchingRestrictions: false,
        enableOverrideRestrClass: true,
        wageAdvanceEnabled: false,
        empNameFormatId: 0,
        timeCardApprovalEnabled: true,
        timeCardApprovalAsSupervisor: false,
        showRateOfOpenSch: false,
        idleTimeout: 300,
        benefitPeriodId: 60,
        approvalText: "I understand that I am approving my time card for the selected pay period.",
        mayAddToWGSheet: false,
        daysBackForHistory: 30,
        applyPaidLunch: true,
        schBuddyCoverage: true,
        inclPrintTimeCard: false,
        timeCardReportName: "Time Card Report",
        benefitPeriodName: "Prev. & Current Calendar Year",
        benefitPeriodAbb: "currPrevYear",
        maySetAvailability: true,
        canSeeCoWorkerSch: true,
        canSeeOpenAssignments: true,
        canSeeOpenSchedules: true,
        openSchWGLevel: 1,
        wageAdvance: false,
        preventChgPwd: true,
        stationProperties: {
          impliedStationNum: 55,
          punchTZXLateMode: 1,
          showPunchMode: 0,
          transAcceptedText: "Transaction Accepted",
          currentTimeMode: 2,
          showCorpTimeStamp: true,
          auxDataCapFields: [],
          empReviewTiles: []
        },
        scheduleConfirmation: {
          reapproveOnChgNotes: true,
          doesConfirmSchs: true,
          confirmPattSchs: true,
          unConfSchDays: 21
        },
        onboardingInvitation: {
          invtModeId: 1,
          invtPeriodDays: 14,
          invtMaxTrys: 3,
          invtMinHrs: 23,
          invtDOHBias: -1
        },
        restClass: {
          classNum: 0,
          BSTEnabled: true,
          BSTBegin: 240,
          BSTEnd: 15,
          ASTEnabled: true,
          ASTBegin: 15,
          ASTEnd: 60,
          BETEnabled: false,
          BETBegin: 60,
          BETEnd: 15,
          AETEnabled: false,
          AETBegin: 15,
          AETEnd: 240,
          MinOutEnabled: false,
          RestFlexEnabled: false
        },
        datedLabelRules: [],
        customProperties: [
          {
            name: "URL:TLN",
            value: "https://www.attendanceondemand.com/learning-center/8-employee-mobile/",
            id: "extModel21-1",
            type: "URL",
            label: "TLN"
          }
        ],
        operational: {
          minimumLeaveRequestDate: "2025-07-22T00:00:00.000",
          maximumLeaveRequestDate: "2056-08-01T00:00:00.000",
          currentPayPeriodBeginDate: "2025-07-21T00:00:00.000",
          currentPayPeriodEndDate: "2025-07-27T00:00:00.000",
          previousPayPeriodBeginDate: "2025-07-14T00:00:00.000",
          previousPayPeriodEndDate: "2025-07-20T00:00:00.000",
          nextPayPeriodBeginDate: "2025-07-28T00:00:00.000",
          nextPayPeriodEndDate: "2025-08-03T00:00:00.000",
          availability: {
            earliestAllowedDate: "2025-07-22T15:05:05.107",
            daysFormulaId: 1,
            days: 30
          }
        },
        availablePlaces: [
          {
            wgName: "Production Floor",
            wgCode: "PF",
            wgNum: 3
          },
          {
            wgName: "Warehouse",
            wgCode: "WH",
            wgNum: 1
          },
          {
            wgName: "Shipping",
            wgCode: "SH",
            wgNum: 2
          },
          {
            wgName: "Office",
            wgCode: "OF",
            wgNum: 4
          }
        ]
      },
      company: {
        name: "Manufacturing Company Inc",
        address1: "1 Industrial Way",
        address2: "",
        city: "Manufacturing City",
        stateProv: "MI",
        postalCode: "48201",
        latitude: 42.348495,
        longitude: -83.0603,
        phoneFields: [
          {
            phonePosIndex: 0,
            phoneLabel: "Work Phone"
          },
          {
            phonePosIndex: 1,
            phoneLabel: "Home Phone"
          },
          {
            phonePosIndex: 2,
            phoneLabel: "Cell Phone"
          }
        ],
        emailFields: [
          {
            emailPosIndex: 0,
            emailLabel: "Work Email"
          },
          {
            emailPosIndex: 1,
            emailLabel: "Personal Email"
          }
        ]
      },
      time: {
        corpTimeZone: -5,
        bypassDaylightSavings: false,
        california: false,
        inProduction: false,
        installationDate: "2024-01-01T08:34:45.219",
        startDOW: 1,
        payroll: "Custom"
      },
      application: {
        maxFaceEnrollments: 3,
        tradingAllowed: true,
        wageAdvanceEligible: false,
        requireBioAttest: false,
        visualScheduling: true
      },
      operator: {
        canSeeRates: true,
        aeUserCode: "KIOSKAPI",
        friendlyName: "KIOSK USER",
        userGroup: "Employee Self Service",
        preferences: {
          timeInAmPm: true,
          timeInHund: false,
          hoursInHund: false,
          schTimeInAmPm: true,
          schTimeInHund: false,
          schHoursInHund: false,
          arcHoursInHund: false
        }
      },
      schStyles: [
        {
          uniqueId: 2621,
          schStyleId: 1,
          "Schedule Style": "On Call",
          comment: "",
          isUnpunchedStyle: false
        },
        {
          uniqueId: 2622,
          schStyleId: 2,
          "Schedule Style": "Absent - No Show",
          comment: "",
          isUnpunchedStyle: false
        },
        {
          uniqueId: 2623,
          schStyleId: 3,
          "Schedule Style": "Scheduled",
          comment: "",
          isUnpunchedStyle: false
        }
      ],
      context: {
        focusDate: new Date().toISOString().split('T')[0] + "T00:00:00.000",
        currentTime: new Date().toISOString(),
        demoMode: true,
        previousPeriodBegins: "2025-07-14T00:00:00.000",
        previousPeriodEnds: "2025-07-20T00:00:00.000",
        currentPeriodBegins: "2025-07-21T00:00:00.000",
        currentPeriodEnds: "2025-07-27T00:00:00.000",
        workedShifts: [
          {
            date: "2025-07-22T00:00:00.000",
            dop: 0,
            dow: 2,
            grossHours: 305,
            hours: 275,
            hundHours: 4.58,
            shiftNum: 0,
            scheduled: false,
            hasWorkSchedule: false,
            hasFlexSchedule: false,
            isWorkedHoliday: false,
            isOddPunchState: false,
            isVirtualShift: false,
            lastPunchState: 0,
            active: true,
            transactions: {
              count: 2,
              actual: [
                {
                  timestamp: "2025-07-22T07:00:00.000",
                  transType: 256,
                  station: 55,
                  id: "trans-001"
                },
                {
                  timestamp: "2025-07-22T12:00:00.000",
                  transType: 0,
                  station: 55,
                  id: "trans-002"
                }
              ],
              rounded: []
            },
            monitoredItems: {
              arrival: {
                afterStart: false
              },
              departure: {
                afterEnd: false
              },
              intervals: {
                outDiffRnd: 0
              },
              shiftExceptions: [],
              breakEvents: [],
              zones: [],
              nonWorkedEvents: []
            }
          }
        ],
        impliedStation: 55,
        maySetAvailability: true,
        canSeeCoWorkerSch: true,
        canSeeOpenAssignments: true,
        canSeeOpenSchedules: true,
        openSchWGLevel: 1,
        inOutStateId: 0,
        defaultWg: {
          description: "Production Floor-Machine Operator-Default-Manufacturing",
          workPositionWgName: "Machine Operator",
          workPositionWgCode: "MOP",
          workPositionName: "Machine Operator",
          workPositionAbb: "MOP",
          levels: [
            {
              wgLevel: 1,
              wgNum: 3,
              caption: "Production Floor"
            },
            {
              wgLevel: 4,
              wgNum: 66,
              caption: "Machine Operator"
            },
            {
              wgLevel: 2,
              wgNum: 1,
              caption: "Default"
            },
            {
              wgLevel: 3,
              wgNum: 9,
              caption: "Manufacturing"
            }
          ]
        },
        operations: [
          {
            operation: 5,
            description: "Capture Tips",
            caption: "Tips",
            fkeyguid: "{516BDD8B-39BB-4A33-A2CD-0304F0AB08B5}",
            hint: "",
            icon: "fa fa-dollar",
            tip1: {
              prompt: true,
              caption: "Enter Tips Amount",
              hint: "Enter Tip Amount",
              payDesId: 30
            },
            tip2: {
              prompt: false,
              caption: "Enter Charge Tips",
              hint: "Enter Charge Tip",
              payDesId: 10
            }
          },
          {
            operation: 4,
            description: "Initiate Waiver",
            caption: "Select Preferences",
            fkeyguid: "{5F9F0772-B6C7-4858-97D5-7E3B5A5F5D90}",
            hint: "",
            icon: "fa fa-cog",
            promptForEffDate: false,
            memo: "",
            days: 1,
            catA: {
              prompt: true,
              caption: "Lunch Waiver",
              defaultId: 2,
              selections: []
            },
            catB: {
              prompt: false,
              caption: "My Options",
              defaultId: 0,
              selections: []
            }
          },
          {
            operation: 2,
            description: "Standard Transfer",
            caption: "Transfer",
            fkeyguid: "{5324678A-4261-40EE-BB3D-1026297ECB37}",
            hint: "",
            icon: "fa fa-exchange",
            alsoPunch: false,
            transType: 0,
            callbackTransType: 20,
            xferStyle: 0,
            xferStyleDescr: "multiList",
            wgRendering: {
                caption: "",
                levels: [
                    {
                        wgLevel: 1,
                        name: "Location",
                        plural: "Location",
                        captionUses: "wgCode"
                    },
                    {
                        wgLevel: 2,
                        name: "Zone",
                        plural: "Zone",
                        captionUses: "wgName"
                    },
                    {
                        wgLevel: 3,
                        name: "Department",
                        plural: "Department",
                        captionUses: "wgName"
                    },
                    {
                        wgLevel: 4,
                        name: "Position",
                        plural: "Position",
                        captionUses: "wgName"
                    }
                ]
            }
          },
          {
            operation: 0,
            description: "Punch In",
            caption: "Punch In",
            fkeyguid: "{488A812A-85A8-4F69-9FE8-0BEE35321789}",
            hint: "",
            icon: "fa fa-clock",
            prerequisites: {
              captureGps: true,
              faceVerify: false,
              geoZone: true,
              autoXfer: false,
              transRuleGuid: "{60F686E6-5283-46FC-8D3F-7A3BB881EB3C}",
              requireGps: true,
              enabled: true
            },
            prompts: {
              askForTransType: true,
              defaultTransType: 0,
              selections: [{
                            id: 0,
                            caption: "End Break"
                        },{
                            id: 512,
                            caption: "End Lunch"
                        },{
                            id: 1024,
                            caption: "Start Shift"
                        }],
              askForCallback: true,
              defaultCallback: 0,
              callbackSelections: [
                    {
                        id: 0,
                        caption: "None"
                    },
                    {
                        id: 1,
                        caption: "On Call"
                    }
                ],
              askForXfer: true,
              xferOperation:{
                  operation: 2,
                  description: "Standard Transfer",
                  caption: "Punch",
                  fkeyguid: "{6E6230E8-68E2-4D1F-AE3E-41C5CDEC6B21}",
                  hint: "",
                  icon: "fa fa-clock",
                  alsoPunch: false,
                  transType: 0,
                  callbackTransType: 20,
                  xferStyle: 0,
                  xferStyleDescr: "multiList",
                  wgRendering: {
                      caption: "",
                      levels: [
                          {
                              wgLevel: 1,
                              name: "Location",
                              plural: "Location",
                              captionUses: "wgCode"
                          },
                          {
                              wgLevel: 2,
                              name: "Zone",
                              plural: "Zone",
                              captionUses: "wgName"
                          },
                          {
                              wgLevel: 3,
                              name: "Department",
                              plural: "Department",
                              captionUses: "wgName"
                          },
                          {
                              wgLevel: 4,
                              name: "Position",
                              plural: "Position",
                              captionUses: "wgName"
                          }
                      ]
                  }
              },
              defaultWg: {}
            }
          },
          {
            operation: 1,
            description: "Punch Out",
            caption: "Punch Out",
            fkeyguid: "{6E6230E8-68E2-4D1F-AE3E-41C5CDEC6B21}",
            hint: "",
            icon: "fa fa-clock",
            prerequisites: {
              captureGps: true,
              faceVerify: false,
              geoZone: true,
              autoXfer: true,
              transRuleGuid: "{0EBFA360-8DCA-422C-B324-092A42BE0A89}",
              requireGps: true,
              enabled: true
            },
            prompts: {
              askForTransType: true,
              defaultTransType: 0,
              selections: [{
                            id: 0,
                            caption: "Take a Break"
                        },
                        {
                            id: 512,
                            caption: "Take a Lunch"
                        }, {
                            id: 1024,
                            caption: "End Shift"
                        }
              ]
            }
          }
        ]
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(mockData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error in kiosk-startup API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
