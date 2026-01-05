!include "LogicLib.nsh"
!include "WinMessages.nsh"

!define MUI_CUSTOMFUNCTION_GUIINIT MarkTextGuiInit

Var ButtonFont

Function MarkTextGuiInit
  ; Match default NSIS button font (Segoe UI 9pt, normal weight).
  CreateFont $ButtonFont "Segoe UI" "9" "400"

  GetDlgItem $0 $HWNDPARENT 1 ; Next / Install
  GetDlgItem $1 $HWNDPARENT 3 ; Back
  GetDlgItem $2 $HWNDPARENT 2 ; Cancel

  SendMessage $0 ${WM_SETFONT} $ButtonFont 1
  SendMessage $1 ${WM_SETFONT} $ButtonFont 1
  SendMessage $2 ${WM_SETFONT} $ButtonFont 1

  ; Measure current button rectangles (convert to parent client coords).
  System::Call '*(i,i,i,i) i .r9'

  System::Call 'USER32::GetWindowRect(p $2, p r9)'
  System::Call 'USER32::MapWindowPoints(p0, p$HWNDPARENT, p r9, i2)'
  System::Call '*$9(i .r3, i .r4, i .r5, i .r6)'
  IntOp $7 $5 - $3   ; cancel width
  IntOp $8 $6 - $4   ; cancel height

  System::Call 'USER32::GetWindowRect(p $1, p r9)'
  System::Call 'USER32::MapWindowPoints(p0, p$HWNDPARENT, p r9, i2)'
  System::Call '*$9(i .r10, i .r11, i .r12, i .r13)'
  IntOp $R4 $R2 - $R0 ; back width

  System::Call 'USER32::GetClientRect(p $HWNDPARENT, p r9)'
  System::Call '*$9(i .r10, i .r11, i .r12, i .r13)'
  StrCpy $R6 120   ; widened Next width for UAC
  StrCpy $R7 8     ; gap between buttons
  StrCpy $R8 12    ; right margin

  IntOp $R0 $R2 - $R8        ; cancel left (step 1)
  IntOp $R0 $R0 - $7         ; cancel left (step 2)

  IntOp $R1 $R0 - $R7        ; next left (step 1)
  IntOp $R1 $R1 - $R6        ; next left (step 2)

  IntOp $R2 $R1 - $R7        ; back left (step 1)
  IntOp $R2 $R2 - $R4        ; back left (step 2)

  System::Call 'USER32::MoveWindow(p $2, i $R0, i $4, i $7,  i $8, i 1)'
  System::Call 'USER32::MoveWindow(p $0, i $R1, i $4, i $R6, i $8, i 1)'
  System::Call 'USER32::MoveWindow(p $1, i $R2, i $4, i $R4, i $8, i 1)'
FunctionEnd

!macro customUnInstall
  MessageBox MB_YESNO "Do you want to delete user settings?" /SD IDNO IDNO SkipRemoval
    SetShellVarContext current
    RMDir /r "$APPDATA\marktext"
  SkipRemoval:
!macroend
