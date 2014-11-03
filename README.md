# dacos-courses v0.0.1

catalogo do sistema da diretoria academica DAC

- [block](#block)
	- [Creates a new block.](#creates-a-new-block.)
	- [Get block information.](#get-block-information.)
	- [List all system blocks.](#list-all-system-blocks.)
	- [Removes block.](#removes-block.)
	- [Updates block information.](#updates-block-information.)
	
- [catalog](#catalog)
	- [Creates a new catalog.](#creates-a-new-catalog.)
	- [Get catalog information.](#get-catalog-information.)
	- [List all system catalogs.](#list-all-system-catalogs.)
	- [Removes catalog.](#removes-catalog.)
	- [Updates catalog information.](#updates-catalog-information.)
	
- [course](#course)
	- [Creates a new course.](#creates-a-new-course.)
	- [Get course information.](#get-course-information.)
	- [List all system courses.](#list-all-system-courses.)
	- [Removes course.](#removes-course.)
	- [Updates course information.](#updates-course-information.)
	
- [discipline](#discipline)
	- [Creates a new discipline.](#creates-a-new-discipline.)
	- [Get discipline information.](#get-discipline-information.)
	- [List all system disciplines.](#list-all-system-disciplines.)
	- [Removes discipline.](#removes-discipline.)
	- [Updates discipline information.](#updates-discipline-information.)
	
- [modality](#modality)
	- [Creates a new modality.](#creates-a-new-modality.)
	- [Get modality information.](#get-modality-information.)
	- [List all system modalities.](#list-all-system-modalities.)
	- [Removes modality.](#removes-modality.)
	- [Updates modality information.](#updates-modality-information.)
	
- [offering](#offering)
	- [Creates a new offering.](#creates-a-new-offering.)
	- [Get offering information.](#get-offering-information.)
	- [List all system offerings.](#list-all-system-offerings.)
	- [Removes offering.](#removes-offering.)
	- [Updates offering information.](#updates-offering-information.)
	
- [requirement](#requirement)
	- [Creates a new requirement.](#creates-a-new-requirement.)
	- [Get requirement information.](#get-requirement-information.)
	- [List all system requirements.](#list-all-system-requirements.)
	- [Removes requirement.](#removes-requirement.)
	- [Updates requirement information.](#updates-requirement-information.)
	


# block

## Creates a new block.

When creating a new block the user must send the block code, type and credits. The block code is used for identifying
and must be unique in the system. If a existing code is sent to this method, a 409 error will be raised. And if no
code or type is sent, a 400 error will be raised.

	POST /catalogs/:catalog/modalities/:modality/blocks

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Block code.							|
| type			| String			|  Block type.							|
| credits			| Number			| **optional** Block credits.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "type": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get block information.

This method returns a single block details, the block code must be passed in the uri to identify the requested
block. If no block with the requested code was found, a 404 error will be raised.

	GET /catalogs/:catalog/modalities/:modality/blocks/:block


### Success Response

HTTP/1.1 200 OK

```
{
 "code": "visao",
 "type": "required",
 "credits": "6",
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system blocks.

This method returns an array with all blocks in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /catalogs/:catalog/modalities/:modality/blocks

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "code": "visao",
 "type": "required",
 "credits": "6",
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes block.

This method removes a block from the system. If no block with the requested code was found, a 404 error will be
raised.

	DELETE /catalogs/:catalog/modalities/:modality/blocks/:block


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates block information.

When updating a block the user must send the block code, type and credits. If a existing code which is not the
original block code is sent to this method, a 409 error will be raised. And if no code or type is sent, a 400 error
will be raised. If no block with the requested code was found, a 404 error will be raised.

	PUT /catalogs/:catalog/modalities/:modality/blocks/:block

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Block code.							|
| type			| String			|  Block type.							|
| credits			| Number			| **optional** Block credits.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "type": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
# catalog

## Creates a new catalog.

When creating a new catalog the user must send the catalog year. The catalog year is used for identifying and must be
unique in the system. If a existing year is sent to this method, a 409 error will be raised. And if no year is sent,
a 400 error will be raised.

	POST /catalogs

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| year			| Number			|  Catalog year.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "year": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get catalog information.

This method returns a single catalog details, the catalog year must be passed in the uri to identify the requested
catalog. If no catalog with the requested year was found, a 404 error will be raised.

	GET /catalogs/:catalog


### Success Response

HTTP/1.1 200 OK

```
{
 "year": 2014,
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system catalogs.

This method returns an array with all catalogs in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /catalogs

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "year": 2014,
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes catalog.

This method removes a catalog from the system. If no catalog with the requested year was found, a 404 error will be
raised.

	DELETE /catalogs/:catalog


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates catalog information.

When updating a catalog the user must send the catalog year. If a existing year which is not the original catalog
year is sent to this method, a 409 error will be raised. And if no year is sent, a 400 error will be raised. If no
catalog with the requested year was found, a 404 error will be raised.

	PUT /catalogs/:catalog

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| year			| Number			|  Catalog year.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "year": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
# course

## Creates a new course.

When creating a new course the user must send the course code, name and level. The course code is used for
identifying and must be unique in the system. If a existing code is sent to this method, a 409 error will be raised.
And if no code, or name or level  is sent, a 400 error will be raised.

	POST /courses

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Course code.							|
| name			| String			|  Course name.							|
| level			| String			|  Course level.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "name": "required",
 "level": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get course information.

This method returns a single course details, the course code must be passed in the uri to identify the requested
course. If no course with the requested code was found, a 404 error will be raised.

	GET /courses/:course


### Success Response

HTTP/1.1 200 OK

```
{
 "code": "42",
 "name": "Ciencia da computação",
 "level": "GRAD",
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system courses.

This method returns an array with all courses in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /courses

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "code": "42",
 "name": "Ciencia da computação",
 "level": "GRAD",
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes course.

This method removes a course from the system. If no course with the requested code was found, a 404 error will be
raised.

	DELETE /courses/:course


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates course information.

When updating a course the user must send the course code, name and level. If a existing code which is not the
original course code is sent to this method, a 409 error will be raised. And if no code, or name or level is sent, a
400 error will be raised. If no course with the requested code was found, a 404 error will be raised.

	PUT /courses/:course

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Course code.							|
| name			| String			|  Course name.							|
| level			| String			|  Course level.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "name": "required",
 "level": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
# discipline

## Creates a new discipline.

When creating a new discipline the user must send the discipline code, name, credits, department and description. The
discipline code is used for identifying and must be unique in the system. If a existing code is sent to this method,
a 409 error will be raised. And if no code, or name or credits are sent, a 400 error will be raised.

	POST /disciplines

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Discipline code.							|
| name			| String			|  Discipline name.							|
| credits			| String			|  Discipline credits.							|
| department			| String			| **optional** Discipline department.							|
| description			| String			| **optional** Discipline description.							|
| requirements			| String []			| **optional** Discipline requirements.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "name": "required",
 "credits": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get discipline information.

This method returns a single discipline details, the discipline code must be passed in the uri to identify the
requested discipline. If no discipline with the requested code was found, a 404 error will be raised.

	GET /disciplines/:discipline


### Success Response

HTTP/1.1 200 OK

```
{
 "code": "MC102",
 "name": "Programação de computadores",
 "credits": 6,
 "department": "IC",
 "description": "Programação de computadores",
 "requirements": [{
   "code": "MC001",
   "name": "Fundamentos de computação",
   "credits": 6,
   "department": "IC",
   "description": "Fundamentos de computação",
   "createdAt": "2014-07-01T12:22:25.058Z",
   "updatedAt": "2014-07-01T12:22:25.058Z"
 }],
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system disciplines.

This method returns an array with all disciplines in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /disciplines

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "code": "MC102",
 "name": "Programação de computadores",
 "credits": 6,
 "department": "IC",
 "description": "Programação de computadores",
 "requirements": [{
   "code": "MC001",
   "name": "Fundamentos de computação",
   "credits": 6,
   "department": "IC",
   "description": "Fundamentos de computação",
   "createdAt": "2014-07-01T12:22:25.058Z",
   "updatedAt": "2014-07-01T12:22:25.058Z"
 }],
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes discipline.

This method removes a discipline from the system. If no discipline with the requested code was found, a 404 error
will be raised.

	DELETE /disciplines/:discipline


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates discipline information.

When updating a discipline the user must send the discipline code, name, credits, department and description. If a
existing code which is not the original discipline code is sent to this method, a 409 error will be raised. And if no
code, or name or credits are sent, a 400 error will be raised. If no discipline with the requested code was found,
a 404 error will be raised.

	PUT /disciplines/:discipline

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Discipline code.							|
| name			| String			|  Discipline name.							|
| credits			| String			|  Discipline credits.							|
| department			| String			| **optional** Discipline department.							|
| description			| String			| **optional** Discipline description.							|
| requirements			| String []			| **optional** Discipline requirements.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "name": "required",
 "credits": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
# modality

## Creates a new modality.

When creating a new modality the user must send the modality code, name, course and creditLimit. The modality code
is used for identifying and must be unique in the catalog. If a existing code is sent to this method, a 409 error
will be raised. And if no code, or name or course is sent, a 400 error will be raised.

	POST /catalogs/:catalog/modalities

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Modality code.							|
| name			| String			|  Modality name.							|
| course			| String			|  Modality course code.							|
| creditLimit			| Number			|  Modality creditLimit.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "name": "required",
 "course": "required"
 "creditLimit": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get modality information.

This method returns a single modality details, the modality code must be passed in the uri to identify the requested
modality. If no modality with the requested code was found, a 404 error will be raised.

	GET /catalogs/:catalog/modalities/:modality


### Success Response

HTTP/1.1 200 OK

```
{
 "code": "AA",
 "name": "Ciencia da computação",
 "course": {
   "code": "42",
   "name": "Ciencia da computação",
   "level": "GRAD",
   "createdAt": "2014-07-01T12:22:25.058Z",
   "updatedAt": "2014-07-01T12:22:25.058Z"
 },
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system modalities.

This method returns an array with all modalities in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /catalogs/:catalog/modalities

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "code": "AA",
 "creditLimit": 30,
 "name": "Ciencia da computação",
 "course": {
   "code": "42",
   "name": "Ciencia da computação",
   "level": "GRAD",
   "createdAt": "2014-07-01T12:22:25.058Z",
   "updatedAt": "2014-07-01T12:22:25.058Z"
 },
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## Removes modality.

This method removes a modality from the system. If no modality with the requested code was found, a 404 error will be
raised.

	DELETE /catalogs/:catalog/modalities/:modality


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates modality information.

When updating a modality the user must send the modality code, name, course and creditLimit. If a existing code which
is not the original modality code is sent to this method, a 409 error will be raised. And if no code, or name or
course, or creditLimit is sent, a 400 error will be raised. If no modality with the requested code was found, a 404 error will be raised.

	PUT /catalogs/:catalog/modalities/:modality

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Modality code.							|
| name			| String			|  Modality name.							|
| course			| String			|  Modality course code.							|
| creditLimit			| Number			|  Modality creditLimit.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "creditLimit": "required"
 "name": "required",
 "course": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
# offering

## Creates a new offering.

When creating a new offering the user must send the offering code, year, period, vacancy, reservations and schedules.
The offering code is used for identifying and must be unique in the year's period for each discipline. If a existing
code is sent to this method, a 409 error will be raised. And if no code, or year, or vacancy or period is sent, a 400
error will be raised. The schedules vector contains the weekday, hour and room of each class of the offering

	POST /disciplines/:discipline/offerings

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Offering code.							|
| year			| Number			|  Offering year.							|
| period			| String			|  Offering period.							|
| reservations			| String []			|  Offering reservations.							|
| vacancy			| Number			|  Offering vacancy.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "year": "required",
 "period": "required",
 "vacancy": required
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get offering information.

This method returns a single offering details, the offering code must be passed in the uri to identify the requested
offering. If no offering with the requested code was found, a 404 error will be raised.

	GET /disciplines/:discipline/offerings/:offering


### Success Response

HTTP/1.1 200 OK

```
{
 "code": "A",
 "year": 2014,
 "period": "1",
 "vacancy": 30,
 "schedules": [
   "weekday" : 1,
   "hour" : 19,
   "room" : "IC302",
 ],
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system offerings.

This method returns an array with all offerings in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /disciplines/:discipline/offerings

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "code": "A",
 "year": 2014,
 "period": "1",
 "vacancy": 30,
 "schedules": [
   "weekday" : 1,
   "hour" : 19,
   "room" : "IC302",
 ],
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes offering.

This method removes a offering from the system. If no offering with the requested code was found, a 404 error will be
raised.

	DELETE /disciplines/:discipline/offerings/:offering


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates offering information.

When updating a offering the user must send the offering code, year, period and schedules. If a existing code which
is not the original offering code is sent to this method, a 409 error will be raised. And if no code, or year or
period is sent, a 400 error will be raised. If no offering with the requested code was found, a 404 error will be
raised.

	PUT /disciplines/:discipline/offerings/:offering

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| String			|  Offering code.							|
| year			| Number			|  Offering year.							|
| period			| String			|  Offering period.							|
| reservations			| String []			|  Offering reservations.							|
| vacancy			| Number			|  Offering vacancy.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "code": "required",
 "year": "required",
 "period": "required",
 "vacancy": required
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
# requirement

## Creates a new requirement.

When creating a new requirement the user must send the requirement suggestedSemester, discipline and mask. The
requirement code is used for identifying and must be unique in the system. If a existing code is sent to this method,
a 409 error will be raised. And if no discipline or mask is sent, a 400 error will be raised.

	POST /catalogs/:catalog/modalities/:modality/blocks/:block/requirements

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| discipline			| String			|  Requirement discipline code.							|
| mask			| String			|  Requirement discipline mask.							|
| suggestedSemester			| Number			|  Requirement suggested semester.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "code": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get requirement information.

This method returns a single requirement details, the requirement code must be passed in the uri to identify the requested
requirement. If no requirement with the requested code was found, a 404 error will be raised.

	GET /catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement


### Success Response

HTTP/1.1 200 OK

```
{
 "discipline": {
   "code": "MC001",
   "name": "Fundamentos de computação",
   "credits": 6,
   "department": "IC",
   "description": "Fundamentos de computação",
   "createdAt": "2014-07-01T12:22:25.058Z",
   "updatedAt": "2014-07-01T12:22:25.058Z"
 },
 "suggestedSemester": 2,
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system requirements.

This method returns an array with all requirements in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /catalogs/:catalog/modalities/:modality/blocks/:block/requirements

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "discipline": {
   "code": "MC001",
   "name": "Fundamentos de computação",
   "credits": 6,
   "department": "IC",
   "description": "Fundamentos de computação",
   "createdAt": "2014-07-01T12:22:25.058Z",
   "updatedAt": "2014-07-01T12:22:25.058Z"
 },
 "suggestedSemester": 2,
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes requirement.

This method removes a requirement from the system. If no requirement with the requested code was found, a 404 error will be
raised.

	DELETE /catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates requirement information.

When updating a requirement the user must send the requirement suggestedSemester, discipline and mask. If a existing
code which is not the original requirement code is sent to this method, a 409 error will be raised. And if no
discipline or mask is sent, a 400 error will be raised. If no requirement with the requested code was found, a 404
error will be raised.

	PUT /catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| discipline			| String			|  Requirement discipline code.							|
| mask			| String			|  Requirement discipline mask.							|
| suggestedSemester			| Number			|  Requirement suggested semester.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "code": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```

