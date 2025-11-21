using OfficeOpenXml;
using OfficeOpenXml.Style;
using Domain.Entities;
using System.Drawing;
using Domain.Enums;


namespace Api.Services
{
    public class ExcelExportService
    {

        public async Task<byte[]> GenerateTicketsExcelAsync(List<Ticket> tickets)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Arıza Kayıtları");

            // ===== HEADER SETUP =====

            var pauseIntervalsByTicket = tickets.ToDictionary(t => t.Id, t => GetPauseIntervals(t));
            var maxPauseCount = pauseIntervalsByTicket.Values.Any()
                ? pauseIntervalsByTicket.Values.Max(list => list.Count)
                : 0;
            var headers = new List<string>
            {
                "Arıza No",
                "Başlık",
                "Açıklama",
                "Kritik",
                "Durum",
                "TTCOMS Kodu",
                "Sistem",
                "Alt Sistem",
                "Bileşen",
                "CI",
                "Parça Tanımı",
                "Parça No",
                "Seri No",
                "Tespit Tarihi",
                "Yükleniciye Bildirim Tarihi",
                "Bildirim Şekli",
                "Tespit Eden",
                "Müdahale Tarihi",
                "Giderilme Tarihi",
                "Müdahale Eden Personel",
                "Gidiren Personel",
                "Yapılan İşlemler",
                "Faaliyet Kontrolü Tarihi",
                "Faaliyet Kontrolü Personeli",
                "Faaliyet Kontrolü Komutanı",
                "Faaliyet Kontrolü Sonucu",
                "Oluşturan",
                "Oluşturma Tarihi",
                "Son Güncelleyen",
                "Güncelleme Tarihi",
                "Teknik Rapor Bilgisi",
                "Geçici Çözüm Tarihi",
                "Güncellenen Parça Tanımı",
                "Güncellenen Parça No",
                "Güncellenen Seri No",
                "Hp No",
                "Kontrol Teşkilatı Durumu",
            };

            // add pause columns at the end (2 columns per pause)
            for (int i = 1; i <= maxPauseCount; i++)
            {
                headers.Add($"Duraklatma {i} Başlangıç");
                headers.Add($"Duraklatma {i} Bitiş");
            }

            // Apply headers
            for (int i = 0; i < headers.Count; i++)
            {
                var cell = worksheet.Cells[1, i + 1];
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(79, 129, 189));
                cell.Style.Font.Color.SetColor(Color.White);
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }

            // ===== DATA ROWS =====
            int row = 2;
            foreach (var ticket in tickets)
            {
                worksheet.Cells[row, 1].Value = ticket.ExternalCode;
                worksheet.Cells[row, 2].Value = ticket.Title;
                worksheet.Cells[row, 3].Value = ticket.Description;
                worksheet.Cells[row, 4].Value = ticket.IsBlocking ? "EVET" : "HAYIR";
                worksheet.Cells[row, 5].Value = GetStatusLabel(ticket.Status.ToString());
                worksheet.Cells[row, 6].Value = ticket.TtcomsCode ?? "";
                worksheet.Cells[row, 7].Value = ticket.System?.Name ?? "";
                worksheet.Cells[row, 8].Value = ticket.Subsystem?.Name ?? "";
                worksheet.Cells[row, 9].Value = ticket.Component?.Name ?? "";
                worksheet.Cells[row, 10].Value = ticket.CI?.Name ?? "";
                worksheet.Cells[row, 11].Value = ticket.ItemDescription ?? "";
                worksheet.Cells[row, 12].Value = ticket.ItemId ?? "";
                worksheet.Cells[row, 13].Value = ticket.ItemSerialNo ?? "";

                // Dates
                worksheet.Cells[row, 14].Value = ticket.DetectedDate?.ToString("dd.MM.yyyy HH:mm") ?? "";
                worksheet.Cells[row, 15].Value = ticket.DetectedContractorNotifiedAt?.ToString("dd.MM.yyyy HH:mm") ?? "";

                // Notification methods
                var notificationMethods = ticket.DetectedNotificationMethods != null && ticket.DetectedNotificationMethods.Length > 0
                    ? string.Join(", ", ticket.DetectedNotificationMethods.Select(m => m.ToString()))
                    : "";
                if (!string.IsNullOrEmpty(ticket.TtcomsCode))
                {
                    notificationMethods = $"TTCOMS ({ticket.TtcomsCode})";
                }
                worksheet.Cells[row, 16].Value = notificationMethods;

                // Personnel - formatted
                worksheet.Cells[row, 17].Value = FormatUserName(ticket.DetectedByUser);
                worksheet.Cells[row, 18].Value = ticket.ResponseDate?.ToString("dd.MM.yyyy HH:mm") ?? "";
                worksheet.Cells[row, 19].Value = ticket.ResponseResolvedAt?.ToString("dd.MM.yyyy HH:mm") ?? "";

                // Response personnel - multiple
                var responsePersonnel = ticket.ResponseByUser != null && ticket.ResponseByUser.Any()
                    ? string.Join(", ", ticket.ResponseByUser.Select(rp => FormatUserName(rp.User)))
                    : "";
                worksheet.Cells[row, 20].Value = responsePersonnel;

                // Resolved personnel - multiple
                var resolvedPersonnel = ticket.ResponseResolvedByUser != null && ticket.ResponseResolvedByUser.Any()
                    ? string.Join(", ", ticket.ResponseResolvedByUser.Select(rp => FormatUserName(rp.User)))
                    : "";
                worksheet.Cells[row, 21].Value = resolvedPersonnel;

                worksheet.Cells[row, 22].Value = ticket.ResponseActions ?? "";
                worksheet.Cells[row, 23].Value = ticket.ActivityControlDate?.ToString("dd.MM.yyyy HH:mm") ?? "";
                worksheet.Cells[row, 24].Value = FormatUserName(ticket.ActivityControlPersonnel);
                worksheet.Cells[row, 25].Value = FormatUserName(ticket.ActivityControlCommander);
                worksheet.Cells[row, 26].Value = ticket.ActivityControlResult ?? "";
                worksheet.Cells[row, 27].Value = FormatUserName(ticket.CreatedBy);
                worksheet.Cells[row, 28].Value = ticket.CreatedAt.ToString("dd.MM.yyyy HH:mm");
                worksheet.Cells[row, 29].Value = FormatUserName(ticket.LastUpdatedBy);
                worksheet.Cells[row, 30].Value = ticket.UpdatedAt.ToString("dd.MM.yyyy HH:mm") ?? "";
                worksheet.Cells[row, 31].Value = ticket.TechnicalReportRequired ? "EVET" : "HAYIR";
                worksheet.Cells[row, 32].Value = ticket.TentativeSolutionDate?.ToString("dd.MM.yyyy HH:mm") ?? "";

                worksheet.Cells[row, 33].Value = ticket.NewItemDescription ?? "";
                worksheet.Cells[row, 34].Value = ticket.NewItemId ?? "";
                worksheet.Cells[row, 35].Value = ticket.NewItemSerialNo ?? "";

                worksheet.Cells[row, 36].Value = ticket.HpNo ?? "";

                worksheet.Cells[row, 37].Value = GetControlStatusLabel(ticket.ActivityControlStatus);

                var pauses = pauseIntervalsByTicket[ticket.Id];
                int col = 38;

                for (int i = 0; i < maxPauseCount; i++)
                {
                    if (i < pauses.Count)
                    {
                        var p = pauses[i];
                        worksheet.Cells[row, col].Value = p.Start.ToString("dd.MM.yyyy HH:mm");
                        worksheet.Cells[row, col + 1].Value = p.End.ToString("dd.MM.yyyy HH:mm");
                    }
                    else
                    {
                        // ticket has fewer pauses than max; leave cells empty
                        worksheet.Cells[row, col].Value = "";
                        worksheet.Cells[row, col + 1].Value = "";
                    }

                    col += 2;
                }

                row++;
            }

            // ===== FORMATTING =====
            // Auto-fit columns
            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

            // Set minimum column widths
            for (int col = 1; col <= headers.Count; col++)
            {
                if (worksheet.Column(col).Width < 12)
                    worksheet.Column(col).Width = 12;
                if (worksheet.Column(col).Width > 50)
                    worksheet.Column(col).Width = 50;
            }

            // Wrap text for description and action columns
            worksheet.Column(3).Style.WrapText = true; // Description
            worksheet.Column(22).Style.WrapText = true; // Response Actions
            worksheet.Column(26).Style.WrapText = true; // Activity Control Result

            // Add borders to all cells
            var allCells = worksheet.Cells[1, 1, row - 1, headers.Count];
            allCells.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            allCells.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            allCells.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            allCells.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

            // Freeze header row
            worksheet.View.FreezePanes(2, 1);

            return await package.GetAsByteArrayAsync();
        }

        private record PauseInterval(DateTime Start, DateTime End);

        private List<PauseInterval> GetPauseIntervals(Ticket ticket)
        {
            var result = new List<PauseInterval>();

            // Only StatusChange actions are relevant for status transitions
            var statusChanges = ticket.Actions
                .Where(a => a.ActionType == ActionType.StatusChange)
                .OrderBy(a => a.PerformedAt)
                .ToList();

            if (!statusChanges.Any())
                return result;

            for (int i = 0; i < statusChanges.Count; i++)
            {
                var current = statusChanges[i];

                // We only care about transitions TO PAUSED
                if (current.ToStatus == TicketStatus.PAUSED)
                {
                    var start = current.PerformedAt;

                    // Find next transition that LEAVES PAUSED
                    var next = statusChanges
                        .Skip(i + 1)
                        .FirstOrDefault(a => a.FromStatus == TicketStatus.PAUSED);

                    // If we never leave PAUSED, we ignore this incomplete interval
                    if (next != null)
                    {
                        result.Add(new PauseInterval(start, next.PerformedAt));

                        // Jump index to the exit action so we don't reuse it
                        i = statusChanges.IndexOf(next);
                    }
                }
            }

            return result;
        }

        private string FormatUserName(User? user)
        {
            if (user == null) return "";

            // If military rank exists: "Rank Name Surname"
            if (user.MilitaryRank != null && !string.IsNullOrWhiteSpace(user.MilitaryRank.DisplayName))
            {
                return $"{user.MilitaryRank.DisplayName} {user.DisplayName}";
            }

            // If non-military but has department: "Department Name Surname"
            if (!string.IsNullOrWhiteSpace(user.Department))
            {
                return $"{user.Department} {user.DisplayName}";
            }

            // Otherwise just: "Name Surname"
            return user.DisplayName;
        }

        private string GetStatusLabel(string status)
        {
            return status switch
            {
                "OPEN" => "AÇIK",
                "PAUSED" => "DURDURULDU",
                "CONFIRMED" => "DOĞRULANDI",
                "CLOSED" => "KAPANDI",
                "REOPENED" => "TEKRAR AÇILDI",
                "CANCELLED" => "İPTAL",
                _ => status
            };
        }


        private string GetControlStatusLabel(Domain.Enums.ControlStatus? status)
        {
            if (!status.HasValue)
                return "";

            return status.Value switch
            {
                Domain.Enums.ControlStatus.Submitted => "Teslim Edildi",
                Domain.Enums.ControlStatus.Approved => "Onaylandı",
                Domain.Enums.ControlStatus.ApprovedPrinted => "Onaylandı ve Basıldı",
                Domain.Enums.ControlStatus.Signed => "İmzalandı",
                Domain.Enums.ControlStatus.ClosedAndPayed => "Kapandı ve Ödendi",
                Domain.Enums.ControlStatus.Cancelled => "İptal Edildi",
                _ => status.Value.ToString()
            };
        }

        
    }
}