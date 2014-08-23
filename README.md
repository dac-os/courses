# dacos-courses v0.0.1

catalogo do sistema da diretoria academica DAC

- [course](#course)
	- [Creates a new course.](#creates-a-new-course.)
	- [Get course information.](#get-course-information.)
	- [List all system courses.](#list-all-system-courses.)
	- [Removes course.](#removes-course.)
	- [Updates course information.](#updates-course-information.)
	


# course

## Creates a new course.

When creating a new course the user must send the course code, name and level. The course code is used for
identifying and must be unique in the system. If a existing code is sent to this method, a 409 error will be raised.
And if no code, or name or level  is sent, a 400 error will be raised.

	POST /courses

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| code			| Number			|  Course code.							|
| name			| Number			|  Course name.							|
| level			| Number			|  Course level.							|

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
 "code": "MC102",
 "name": "Programação de computadores",
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
 "code": "MC102",
 "name": "Programação de computadores",
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
| code			| Number			|  Course code.							|
| name			| Number			|  Course name.							|
| level			| Number			|  Course level.							|

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

