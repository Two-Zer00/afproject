const menuHTML = 
    '<div class=\"sticky-top bg-white shadow-sm container-lg\">'+
        '<ul class=\"nav justify-content-center fs-3\">'+
            '<li class=\"nav-item\">'+
                '<a class=\"nav-link bi bi-house link-dark\" href=\"/\"></a>'+
            '</li>'+
            '<li class=\"nav-item d-flex align-items-center\" style=\"width: 40px;\">'+
                '<img src=\"/staticFiles/favicon.png\" tabindex=\"-1\" alt=\"logo\" clas=\"user-selection-none\" style=\"width:100%;\">'+
            '</li>'+
            '<li class=\"nav-item\" id=\"myDropdown\">'+
                '<a class=\"nav-link bi bi-person link-dark\" id=\"dropdownMenuButton\" data-bs-toggle=\"dropdown\" data-bs-auto-close=\"outside\" aria-expanded=\"false\" href=\"#\"></a>'+
                '<div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\" id=\"dropdown\">'+
                '<form class=\"px-4 py-3\" id=\"loginForm\" style=\"width: 260px;\">'+
                    '<div class=\"mb-3\">'+
                    '<label for=\"exampleDropdownFormEmail1\" class=\"form-label\">Email address</label>'+
                    '<input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"email@example.com\" required>'+
                    '</div>'+
                    '<div class=\"mb-3\">'+
                    '<label for=\"exampleDropdownFormPassword1\" class=\"form-label\">Password</label>'+
                    '<input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" required>'+
                    '</div>'+
                    '<button type=\"submit\" class=\"btn btn-outline-dark\">Sign in</button>'+
                    '<div class=\"\">'+
                    '<label for=\"googleLogin\" style=\"display: block;\">Also login with:</label>'+
                    '<a href=\"javascript:void(0)\" id=\"googleLogin\" class=\"bi bi-google link-dark\" onclick=\"loginUsingGoogle()\"></a>'+
                    '</div>'+
                '</form>'+
                '<div class=\"dropdown-divider\"></div>'+
                '<a class=\"dropdown-item\" href=\"/login\" id=\"signUp\">New around here? Sign up</a>'+
                '</div>'+
            '</li>'+
        '</ul>'+
    '</div>';