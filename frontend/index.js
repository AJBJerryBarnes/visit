// JavaScript source code


import { FormField, Input, ViewPicker, initializeBlock, useBase, useRecords, expandRecord, Button, TextButton } from '@airtable/blocks/ui';
import React, { useState } from "react"; 

function Visit() {
	
	const [memberName, setMemberName] = useState("");
	const [memberNo, setMemberNo] = useState("");	
	const [memberRecId, setMemberRecId] = useState("");
	
    const base = useBase();
    const memberTable = base.getTableByName('MemberDetails');
    const memberQuery = memberTable.selectRecords();
    const memberRecordset = useRecords(memberQuery);

    // the filter will give a case insensitive search provided at least 1 chr is entered
	const memberRecords = memberRecordset.filter(member => {
        return (memberName.length > 0 && member.getCellValue("FullName").toUpperCase().startsWith(memberName.toUpperCase()))
    });
	
    const timeslotTable = base.getTableByName('Timeslots');	
	const timeslotView = timeslotTable.getViewByName('Today');	
	const timeslotQuery = timeslotView.selectRecords();
	const timeslotRecordset = useRecords(timeslotQuery);
	
	if (timeslotRecordset.length == 0){
		return (
			<div>
			There are no timeslots for today
			</div>
		);
	}
				
	const timeslotRecords = timeslotRecordset.filter(slot => {
		return (slot.getCellValue("mcopy") == memberNo)
    });
	
	//if we want to show free slots to be selected but there are none then 
	//show the message.  Nb this means we have already run the code in the
	//statement below to realise we want to find a free slot.
	if (timeslotRecords.length == 0 && memberNo == null){
		return (
			<div>
			There are no free timeslots to allocate for today
			</div>
		);
	}
	
	//console.log("member no is ", memberNo);
	// so if we have selected a member but there are no timeslots allocated to that
	// member we want to display a list of unallocated timeslots so one can be selected
	if (memberNo != -1 && memberRecords.length > 0 && timeslotRecords.length == 0) {
		//console.log("setting member no to null ", memberNo);
		setMemberNo(null);
		}
	//console.log("about to return jsx");
	
	// we will return
	// the input field for member name
	// a list of member records matching the name (partial matches allowed)
	// a list (should only be one) of allocated timeslots or
	// a list of unallocated timeslots
    return (
		<div>
			<FormField label="Member name">
				<Input value={memberName} onChange={e => memberChange(setMemberName, setMemberNo, e.target.value)} />
			</FormField>
			
				{memberRecords.map(record => (
					<li key={record.id}>
						<TextButton
							variant="dark"
							size="xlarge"
							onClick={() => {
								memberSelected(setMemberNo, record.getCellValue("Member No"), setMemberRecId, record.id);
							}}
							
						>
						{record.getCellValue("FullName")} ,
						</TextButton> 
						{record.getCellValue("Address")} , {record.getCellValue("Postcode")} , 
						Familly size {record.getCellValue("Family Size")}
						
					</li>
				))}
				
				<br></br>
				{
			timeslotRecords.map(tRecord => (
					<li key={tRecord.id}>
						<TextButton
							variant="dark"
							size="xlarge"
							onClick={() => {
								selectTimeslot(timeslotTable, tRecord, memberRecId, setMemberName, setMemberNo);
							}}
							
						>
						{slotDetails(tRecord)} 
						</TextButton> 
						
						
					</li>
				))}

		</div>
    );
}

function memberChange(settera, setterb, param){
	settera(param);
	setterb(-1);
	//console.log("memberChange");
}

function memberSelected(settera, param, setterb, paramb){
		settera(param);
		setterb(paramb);
		//console.log("memberSelected");
}

function slotDetails(record){
	
	// show details of this record in the list of timeslots to choose from
	// may only be a single one if allocated
	const d = new Date(record.getCellValue("Date"));
	let text = d.toLocaleTimeString();
	if (record.getCellValue("Member No") == null){
		text = text + " free to use";
	}
	else {
		text = text + " allocated";
	}
	return text;

	
}

function selectTimeslot(tTimeslots, tRecord, memberRecordId, settera, setterb){
	
	// A timeslot has been selected.  If its allready linked to a member
	// then just use it, otherwise link the timeslot to the previously
	// selected member
	if (tRecord.getCellValue("Member No") == null){
		// its an error if use await to confirm saving ???
		tTimeslots.updateRecordAsync(tRecord.id, {
							"Member No": [{id: memberRecordId}],
								}).then(expandRecord(tRecord));
		// after linking the timeslot to a member the list will still be showing
		// un allocated timeslots which may be confusing.
		// so clear the name and set member number to -1 
		//console.log("selectTimeslot");
	}else{
		expandRecord(tRecord);
	}
	// after linking the timeslot to a member the list may still be showing
	// un allocated timeslots which may be confusing.  Also the vist update has 
	// completed so lets clear the name and set member number to -1 ready for 
	// the next member visit
	//console.log("selectTimeslot");
	settera("");
	setterb(-1);
}

initializeBlock(() => <Visit />);

